const { API_KEY, API_PRIV_KEY } = require("../../config");
const { APIError } = require("../../utils/api-error");

//Note : here we are using our own custom api keys not jwt token
const validateAPIKeys = (req, res, next) => {
  try {
    let apiKey = req.headers.apiauthkey;
    let apiPrivateKey = req.headers.apiprivatekey;
    if (!apiKey || !apiPrivateKey) {
      res.status(401);
      throw new APIError(
        `api keys required: found apiKey : ${apiKey} &&  apiPrivateKey : ${apiPrivateKey}`,
        401
      );
    }
    if (apiKey == API_KEY && apiPrivateKey == API_PRIV_KEY) {
      next();
    } else {
      throw new APIError("un-authrorised API Keys", 401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { validateAPIKeys };
