// Meeting validation rules
const { body, param } = require('express-validator')

exports.createMeetingValidation = [
  body('title')
    .notEmpty()
    .withMessage('Meeting title is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('capacity')
    .optional()
    .isInt({ min: 2, max: 250 })
    .withMessage('Capacity must be between 2 and 250')
]

exports.meetingCodeValidation = [
  param('code')
    .notEmpty()
    .withMessage('Meeting code is required')
    .isLength({ min: 6, max: 10 })
    .withMessage('Invalid meeting code format')
]
