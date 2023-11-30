const async = require("async");
const {
  trackContract,
  untrackContract,
  withdraw,
  getMapTokenToAddress,
  checkTokenAddress,
} = require("../services/onchain.service");

exports.suscribeToAddress = async (req, res, next) => {
  try {
    const { address, startingBlockId } = req.body;
    trackContract(address, this.onNewTransaction, startingBlockId);
    res.status(200).json({ msg: `new token ${address} add for tracking...` });
  } catch (error) {
    next(error);
  }
};

exports.unsuscribeToAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    const response = untrackContract(address);
    res.status(200).json({ msg: response });
  } catch (error) {
    next(error);
  }
};

/**
 *  The function put the request in the queue to process one transaction at a time
 * @param {to : user wallet address, address : token contract address, amount : amount to send} req
 *
 */
exports.withdrawToken = async (req, res, next) => {
  try {
    const { toAddress, address, amount } = req.body;
    if (!(await checkTokenAddress(address))) return;
    //queuing the transaction so that it can take multiple request and process each transaction one by one...
    withdrawQueue.push({ toAddress, amount, address }, (error, receipt) => {
      console.log(receipt);
      if (error) {
        console.log(`An error occurred while processing task`, error);
      } else {
        console.log(
          `amount withdraw with transactionHash ${receipt.transactionHash}`
        );
      }
    });
    return res
      .status(200)
      .json({ msg: `transaction successfully submitted...` });
  } catch (error) {
    next(error);
  }
};

// Defining the queue to handle the withdraw queue process...
const withdrawQueue = async.queue(
  ({ toAddress, amount, address }, completed) => {
    console.log(
      `Currently transferring ${amount} to ${toAddress} of contract address ${address}`
    );
    return new Promise(async (resolve, reject) => {
      try {
        const receipt = await withdraw(toAddress, amount, address);
        resolve(completed(null, receipt));
      } catch (error) {
        reject(completed(error));
      }
    });
  },
  1
);

exports.getMapAddresses = async (req, res, next) => {
  try {
    const addresses = await getMapTokenToAddress();
    return res.status(200).json({ addresses });
  } catch (error) {
    next(error);
  }
};

exports.onNewTransaction = async (address, from, to, amount, event) => {
  try {
    const blockNumber = event.blockNumber;
    const transactionHash = event.transactionHash.toLowerCase();

    console.log(`transfer event hit for contract address ${address}`);
    console.log(
      `transfer token from ${from} to ${to} amount ${amount} having blockNumber ${blockNumber} and transactionHash ${transactionHash}`
    );
    /**
     * here we can filter and handle the transaction belong to us...
     */
  } catch (error) {
    console.log(error);
  }
};
