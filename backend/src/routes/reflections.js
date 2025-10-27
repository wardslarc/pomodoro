const express = require('express');
const { body } = require('express-validator');
const {
  createReflection,
  getReflections,
  updateReflection,
  deleteReflection
} = require('../controllers/reflectionsController');
const auth = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const reflectionValidation = [
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required'),
  body('learnings')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Learnings must be between 1 and 1000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters')
];

// Routes
router.post('/', auth, reflectionValidation, handleValidationErrors, createReflection);
router.get('/', auth, getReflections);
router.put('/:id', auth, reflectionValidation, handleValidationErrors, updateReflection);
router.delete('/:id', auth, deleteReflection);

module.exports = router;