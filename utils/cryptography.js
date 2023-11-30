const { APIError } = require("./api-error");
const { contract_abi } = require("../contract");
const abiDecoder = require("abi-decoder");

module.exports.decodeLogs = (logs) => {
  try {
    abiDecoder.addABI(contract_abi);
    return abiDecoder.decodeLogs(logs);
  } catch (error) {
    throw new APIError(error.message, 400);
  }
};
