/**
 * Minimal request logger. Logs method, path, status and duration only -
 * never headers or bodies, so tokens and passwords are never written out.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 500) console.error(`[http] ${line}`);
    else console.log(`[http] ${line}`);
  });
  next();
};

module.exports = requestLogger;
