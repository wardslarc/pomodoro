const { createLogger, format, transports } = require('winston');
const config = require('../config/env');

// Define log format
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  format.errors({ stack: true }),
  format.json()
);

// Development format (more human-readable)
const developmentFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Create the logger
const logger = createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'pomodoro-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console
if (config.env !== 'production') {
  logger.add(new transports.Console({
    format: developmentFormat,
  }));
}

// If we're in production, add a console transport with JSON format
if (config.env === 'production') {
  logger.add(new transports.Console({
    format: logFormat,
  }));
}

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;