const { body, param } = require('express-validator')

const assignRoleValidation = [
  body('targetUserId')
    .notEmpty().withMessage('ID người dùng mục tiêu là bắt buộc')
    .isMongoId().withMessage('ID người dùng không hợp lệ'),
  body('role')
    .notEmpty().withMessage('Vai trò là bắt buộc')
    .isIn(['host', 'co-host', 'moderator', 'presenter', 'participant'])
    .withMessage('Vai trò không hợp lệ')
]

const meetingIdValidation = [
  param('meetingId')
    .notEmpty().withMessage('ID cuộc họp là bắt buộc')
    .isMongoId().withMessage('ID cuộc họp không hợp lệ')
]

module.exports = {
  assignRoleValidation,
  meetingIdValidation
}
