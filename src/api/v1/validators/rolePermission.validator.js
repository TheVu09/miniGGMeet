const { body, param } = require('express-validator')

const assignRoleValidation = [
  body('targetUserId')
    .notEmpty().withMessage('Target user ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['host', 'co-host', 'moderator', 'presenter', 'participant'])
    .withMessage('Invalid role')
]

const meetingIdValidation = [
  param('meetingId')
    .notEmpty().withMessage('Meeting ID is required')
    .isMongoId().withMessage('Invalid meeting ID')
]

module.exports = {
  assignRoleValidation,
  meetingIdValidation
}
