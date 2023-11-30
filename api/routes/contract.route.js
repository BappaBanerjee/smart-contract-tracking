const express = require("express");
let contractRouter = express.Router();

const {
  suscribeToAddress,
  unsuscribeToAddress,
  withdrawToken,
  getMapAddresses,
} = require("../../controllers/token.controller");
const { validator } = require("../middlewares/joi.middleware");
const schema = require("../../schemas/contract.schema");

contractRouter.post(
  "/",
  validator(schema.suscribeToAddress),
  suscribeToAddress
);
contractRouter.get("/", getMapAddresses);
contractRouter.delete(
  "/",
  validator(schema.unsuscribeToAddress),
  unsuscribeToAddress
);
contractRouter.post(
  "/withdraw",
  validator(schema.withdrawToken),
  withdrawToken
);

module.exports = contractRouter;
