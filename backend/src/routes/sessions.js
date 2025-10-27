const express = require('express');
const { body, query } = require('express-validator');
const {
  createSession,
  getSessions,
  getSessionStats,
  getSessionById,
  updateSession,
  deleteSession
} = require('../controllers/sessionsController');
const auth = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { controllerHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Validation rules for session creation
const sessionValidation = [
  body('sessionType')
    .isIn(['work', 'break', 'longBreak'])
    .withMessage('Session type must be work, break, or longBreak'),
  body('duration')
    .isInt({ min: 1, max: 180 })
    .withMessage('Duration must be between 1 and 180 minutes'),
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('CompletedAt must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters')
];

// Validation rules for query parameters
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sessionType')
    .optional()
    .isIn(['work', 'break', 'longBreak'])
    .withMessage('Session type must be work, break, or longBreak'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

// Routes

/**
 * @route POST /api/sessions
 * @description Create a new session
 * @access Private
 */
router.post(
  '/', 
  auth, 
  sessionValidation, 
  handleValidationErrors, 
  controllerHandler(createSession)
);

/**
 * @route GET /api/sessions
 * @description Get user's sessions with optional filtering and pagination
 * @access Private
 */
router.get(
  '/', 
  auth, 
  queryValidation, 
  handleValidationErrors, 
  controllerHandler(getSessions)
);

/**
 * @route GET /api/sessions/stats
 * @description Get session statistics and analytics
 * @access Private
 */
router.get(
  '/stats', 
  auth, 
  queryValidation, 
  handleValidationErrors, 
  controllerHandler(getSessionStats)
);

/**
 * @route GET /api/sessions/:id
 * @description Get a specific session by ID
 * @access Private
 */
router.get(
  '/:id', 
  auth, 
  controllerHandler(getSessionById)
);

/**
 * @route PUT /api/sessions/:id
 * @description Update a session
 * @access Private
 */
router.put(
  '/:id', 
  auth, 
  sessionValidation, 
  handleValidationErrors, 
  controllerHandler(updateSession)
);

/**
 * @route DELETE /api/sessions/:id
 * @description Delete a session
 * @access Private
 */
router.delete(
  '/:id', 
  auth, 
  controllerHandler(deleteSession)
);

module.exports = router;