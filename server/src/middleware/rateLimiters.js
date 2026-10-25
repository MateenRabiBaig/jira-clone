const rateLimit = require('express-rate-limit');

/** Guards credential endpoints against brute-force attempts. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

/** Looser limit for password changes and account deletion. */
const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

module.exports = { authLimiter, sensitiveActionLimiter };
