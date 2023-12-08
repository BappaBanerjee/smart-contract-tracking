const { contract_abi, provider } = require("../contract");
const { WALLET_PRIVATE_KEY } = require("../config");
const TokenService = require("./token.service");
const { decodeLogs } = require("../utils/cryptography");
const { APIError } = require("../utils/api-error");

let mapAddressToTokenService = new Map();

function trackContract(address, onNewTransaction, prevBlockId = 0) {
  if (mapAddressToTokenService.has(address))
    throw new Error(`address already mapped`);

  let tokenService = new TokenService(
    address,
    contract_abi,
    provider,
    prevBlockId,
    onNewTransaction
  );
  mapAddressToTokenService.set(address, tokenService);
  return tokenService;
}

function untrackContract(address) {
  if (!mapAddressToTokenService.has(address))
    throw new Error(`no such contract`);
  mapAddressToTokenService.get(address).StopListening();
  mapAddressToTokenService.delete(address);
  return true;
}

async function withdraw(to, amount, address) {
  try {
    if (!mapAddressToTokenService.has(address))
      throw new Error(`contract address is not tracked`);

    const receipt = await mapAddressToTokenService
      .get(address)
      .Withdraw(to, amount, WALLET_PRIVATE_KEY);
    console.log(receipt);
    return receipt;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

async function getTransactionDetails(tx_hash) {
  try {
    console.log(`fetching transaction with tx hash ${tx_hash}`);
    const txReceipt = await getTransactionReceipt(tx_hash);

    //check if the transaction hash exist in the blockchain or not
    if (!txReceipt) {
      throw new Error(`invalid transactionHash`);
    }

    const instance = mapAddressToTokenService.get(txReceipt.to);
    const decimal = await instance.contract.decimals();
    const symbol = await instance.contract.symbol();
    console.log(`decoding the logs`);
    const decodedLogs = decodeLogs(txReceipt.logs);
    console.log(`decoding length is ${decodedLogs.length}`);
    if (decodedLogs.length > 1) {
      console.log(`decoded length found greater than 1`);
      throw new Error(
        `this transaction can't be processed, please check logs of the transaction.`
      );
    }

    const logs = decodedLogs[0].events;
    let data = { decimal, symbol, blockNumber: txReceipt.blockNumber };
    for (let log of logs) {
      data[log.name] = log.value;
    }
    return data;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

async function getBlock(blockNumber) {
  try {
    console.log(`fetching the block for ${blockNumber}`);
    const block = await provider.getBlock(blockNumber);
    return block;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

async function getCurrentBlockNumber() {
  try {
    console.log(`fetching the latest block...`);
    const block = await provider.getBlockNumber();
    return block;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

async function getTransactionReceipt(hash) {
  try {
    const receipt = await provider.getTransactionReceipt(hash);
    return receipt;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

async function getMapTokenToAddress() {
  try {
    const result = Object.fromEntries(mapAddressToTokenService.entries());
    let keys = Object.keys(result);
    return keys;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

async function checkTokenAddress(address) {
  try {
    const key = mapAddressToTokenService.has(address);
    if (!key)
      throw new APIError(`can't withdraw, contract address is not tracked`);
    return true;
  } catch (error) {
    throw new APIError(error.message, error.stautCode);
  }
}

module.exports = {
  trackContract,
  untrackContract,
  withdraw,
  getTransactionDetails,
  getBlock,
  getCurrentBlockNumber,
  getTransactionReceipt,
  getMapTokenToAddress,
  checkTokenAddress,
};
