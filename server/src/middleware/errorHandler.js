const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError' && err.errors) {
    // Mongoose schema validation
    statusCode = 400;
    const first = Object.values(err.errors)[0];
    message = first ? first.message : 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'identifier'}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `A record with that ${field} already exists` : 'Duplicate record';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : `Upload failed: ${err.message}`;
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON body';
  }

  if (statusCode >= 500) {
    // Log full details server-side, but never send internals to the client.
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${statusCode}`);
    console.error(err.stack || err);
    message = 'Internal server error';
  }

  res.status(statusCode).json({ message });
};

module.exports = { notFoundHandler, errorHandler, ApiError };
