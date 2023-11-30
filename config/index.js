const { APIError } = require("../utils/api-error");

require("dotenv").config();

const API_KEY = process.env.API_KEY;
const API_PRIV_KEY = process.env.API_PRIV_KEY;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY;
const SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY;

const checkENV = () => {
  if (
    !API_KEY ||
    !API_PRIV_KEY ||
    !WALLET_PRIVATE_KEY ||
    !WALLET_PUBLIC_KEY ||
    !SEPOLIA_API_KEY
  ) {
    throw new APIError(
      `undeclare variable in env file, please check your .env files`
    );
  } else {
    console.log(`valid env found`);
  }
};

module.exports = {
  checkENV,
  API_KEY,
  API_PRIV_KEY,
  WALLET_PRIVATE_KEY,
  WALLET_PUBLIC_KEY,
  SEPOLIA_API_KEY,
};
