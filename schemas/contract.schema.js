const joi = require("joi");
const suscribeToAddress = joi.object({
  address: joi.string().length(42).required(),
  startingBlockId: joi.number().positive(),
});

const unsuscribeToAddress = joi.object({
  address: joi.string().length(42).required(),
});

const withdrawToken = joi.object({
  toAddress: joi.string().length(42).required(),
  address: joi.string().length(42).required(),
  amount: joi.number().positive().required(),
});
module.exports = {
  suscribeToAddress,
  unsuscribeToAddress,
  withdrawToken,
};
