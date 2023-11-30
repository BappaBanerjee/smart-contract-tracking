module.exports.validator = (schema) => {
  return (req, res, next) => {
    var { value, error } = schema.required().validate(req.body);
    if (error) {
      next(error);
    } else {
      req.body = value;
      next();
    }
  };
};
