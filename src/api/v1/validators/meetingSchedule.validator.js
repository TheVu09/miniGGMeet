const { body, param } = require('express-validator')

const scheduleValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('scheduledStartTime')
    .notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Invalid date format'),
  body('scheduledEndTime')
    .notEmpty().withMessage('End time is required')
    .isISO8601().withMessage('Invalid date format'),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes')
]

const scheduleIdValidation = [
  param('scheduleId')
    .notEmpty().withMessage('Schedule ID is required')
    .isMongoId().withMessage('Invalid schedule ID')
]

const respondValidation = [
  body('response')
    .notEmpty().withMessage('Response is required')
    .isIn(['accepted', 'declined', 'tentative']).withMessage('Invalid response')
]

module.exports = {
  scheduleValidation,
  scheduleIdValidation,
  respondValidation
}
