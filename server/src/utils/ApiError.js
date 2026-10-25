/**
 * Operational error with an HTTP status code. Errors created with this class
 * are safe to expose to clients; anything else is treated as a server fault.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
