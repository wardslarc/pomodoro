const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Signup validation rules
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Session validation rules
const validateSession = [
  body('sessionType')
    .isIn(['work', 'break', 'longBreak'])
    .withMessage('Invalid session type'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive number'),
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('CompletedAt must be a valid date'),
  handleValidationErrors
];

// Reflection validation rules - accepts both MongoDB IDs and local session IDs
const validateReflection = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .custom((value) => {
      if (typeof value !== 'string') {
        throw new Error('Session ID must be a string');
      }
      
      // Allow both MongoDB ObjectIds and local session IDs
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(value);
      const isLocalId = value.startsWith('local-');
      
      if (!isMongoId && !isLocalId) {
        throw new Error('Invalid session ID format. Must be MongoDB ObjectId or local session ID');
      }
      
      return true;
    }),
  body('learnings')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Learnings must be between 1 and 2000 characters'),
  body('createdAt')
    .optional()
    .isISO8601()
    .withMessage('CreatedAt must be a valid date'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateSession,
  validateReflection
};