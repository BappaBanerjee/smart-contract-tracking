const ErrorHandler = async (err, req, res, next) => {
  console.log("=========error logged=========");
  console.log(err.stack);
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || "Something went wrong";

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    // stack: err.stack,
  });
};

module.exports = {
  ErrorHandler,
};
