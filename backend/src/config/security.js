const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
});

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for certain conditions
    skip: (req) => {
      // Skip for health checks
      if (req.url === '/health') return true;
      // In development, you might want to skip
      if (process.env.NODE_ENV === 'development') return false;
      return false;
    },
  });
};

// Specific rate limiters
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts from this IP, please try again later.'
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests from this IP, please try again later.'
);

const strictLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 requests
  'Too many requests from this IP, please slow down.'
);

module.exports = {
  securityHeaders,
  authLimiter,
  apiLimiter,
  strictLimiter,
};