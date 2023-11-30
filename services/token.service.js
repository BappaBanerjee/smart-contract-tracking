const { ethers } = require("ethers");
const MAX_AT_A_TIME = 1;

/** Token Service
 * Listen to new transactions on this contract
 * Process old transactions, when prevBlockId is provided
 * Stop the service
 * Withdraw tokens of this contract to the address provided
 */
class TokenService {
  constructor(address, contract_abi, provider, prevBlockId, onNewTransaction) {
    this.address = address;
    this.contract_abi = contract_abi;
    this.provider = provider;
    this.prevBlockId = prevBlockId;
    this.onNewTransaction = onNewTransaction;
    this.contract = new ethers.Contract(
      this.address,
      this.contract_abi,
      this.provider
    );
    this.ListenToNewTransaction();

    if (this.prevBlockId > 0) this.ProcessLeftTransaction(prevBlockId);
  }

  async StopListening() {
    console.log(`listner stop for contract address ${this.address}`);
    let listners = this.contract.listeners("Transfer");
    this.contract.off("Transfer", listners[0]);
    return true;
  }

  async ListenToNewTransaction() {
    console.log(`listening to contract address ${this.address}`);
    this.contract.on("Transfer", async (from, to, value, event) => {
      const decimal = this.contract.decimals();
      const amount = value / 10 ** decimal;
      this.onNewTransaction(
        this.contract.address,
        from,
        to,
        amount,
        event,
        true
      );
    });
  }

  async ProcessLeftTransaction(prevBlockId) {
    console.log(
      `processing left transaction for contract ${this.contract.address}`
    );
    const currentBlockId = await this.provider.getBlockNumber();
    for (let i = prevBlockId; i < currentBlockId; i += MAX_AT_A_TIME) {
      const _startBlock = i;
      const _endBlock = Math.min(currentBlockId, i - 1 + MAX_AT_A_TIME);
      console.log(
        `reading blocks from ${_startBlock} to ${_endBlock} out of ${currentBlockId} for contract ${this.contract.address}`
      );
      let event = await this.contract.queryFilter(
        "Transfer",
        _startBlock,
        _endBlock
      );

      //loop through each allEvents....
      for (let i = 0; i < event.length; i++) {
        try {
          let from = event[i].args[0];
          let to = event[i].args[1];
          let value = event[i].args[2];

          await this.onNewTransaction(
            this.contract.address,
            from,
            to,
            value,
            event[i],
            false
          );
        } catch (error) {
          console.log(error.message);
        }
      }
    }
    console.log(
      `processing left transaction ended for contract ${this.contract.address}`
    );
  }

  async Withdraw(to, amountToSend, privKey) {
    console.log(`withdrawing....`);
    let wallet = new ethers.Wallet(privKey);
    let walletSigner = wallet.connect(this.provider);

    // general token send
    let contract = new ethers.Contract(
      this.address,
      this.contract_abi,
      walletSigner
    );

    const decimal = await this.contract.decimals();

    // How many tokens?
    let numberOfTokens = ethers.utils.parseUnits(
      amountToSend.toString(),
      decimal
    );

    //Define the data parameter
    const data = contract.interface.encodeFunctionData("transfer", [
      to,
      numberOfTokens,
    ]);

    let gasPrice = await this.provider.getGasPrice();

    console.log(`sending transaction request...`);

    // Creating and sending the transaction object
    const tx_result = await walletSigner.sendTransaction({
      to,
      from: walletSigner.address,
      value: ethers.utils.parseUnits("0.000", "ether"),
      gasPrice,
      gasLimit: 100000,
      data: data,
    });

    console.log(`mining transaction...with hash ${tx_result.hash}`);
    // Waiting for the transaction to be mined
    const receipt = await tx_result.wait();

    // The transaction is now on chain!
    console.log(
      `mined in block ${receipt.blockNumber} with hash ${tx_result.hash}`
    );
    return receipt;
  }
}

module.exports = TokenService;
