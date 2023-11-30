const { checkENV } = require("./config");
const express = require("express");
const { validateAPIKeys } = require("./api/middlewares/accessToken.middleware");
const { ErrorHandler } = require("./api/middlewares/errorHandler.middleware");
const contractRouter = require("./api/routes/contract.route");
const app = express();
app.use(express.json());

const port = 4656;

app.use(validateAPIKeys);
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api/contracts", contractRouter);
app.use(ErrorHandler);

const start = async () => {
  try {
    checkENV();
    app.listen(port, () => console.log(`Listening on port :${port}`));
  } catch (e) {
    console.error(
      `Error occured when starting the server with a message ${e.message}`
    );
    process.exit(1);
  }
};

start();
