const { validationResult } = require('express-validator');
const { ApiResponse } = require('./apiResponse');

/**
 * Custom validation rules
 */
const customValidators = {
  // Validate MongoDB ObjectId
  isObjectId: (value) => {
    if (!value) return false;
    return /^[0-9a-fA-F]{24}$/.test(value);
  },

  // Validate session type
  isSessionType: (value) => {
    return ['work', 'break', 'longBreak'].includes(value);
  },

  // Validate notification sound
  isNotificationSound: (value) => {
    return ['bell', 'chime', 'beep', 'none'].includes(value);
  },

  // Validate array of tags
  isTagsArray: (value) => {
    if (!Array.isArray(value)) return false;
    return value.every(tag => 
      typeof tag === 'string' && 
      tag.length <= 20 && 
      /^[a-zA-Z0-9\s\-_]+$/.test(tag)
    );
  },
};

/**
 * Custom sanitizers
 */
const customSanitizers = {
  // Sanitize email
  normalizeEmail: (value) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    return value;
  },

  // Sanitize string (trim and remove extra spaces)
  normalizeString: (value) => {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ');
    }
    return value;
  },

  // Sanitize array (remove empty values and trim)
  normalizeArray: (value) => {
    if (Array.isArray(value)) {
      return value
        .map(item => typeof item === 'string' ? item.trim() : item)
        .filter(item => item !== '');
    }
    return value;
  },
};

/**
 * Enhanced validation result handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json(
      ApiResponse.error('Validation failed', null, { errors: errorMessages }).toJSON()
    );
  }
  
  next();
};

module.exports = {
  customValidators,
  customSanitizers,
  handleValidationErrors,
};