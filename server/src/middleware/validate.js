const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator chains; converts validation failures into a
 * 400 response with the first human-readable message.
 */
const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const first = result.array({ onlyFirstError: true })[0];
  return next(new ApiError(400, first ? first.msg : 'Validation failed'));
};

module.exports = { validate };
