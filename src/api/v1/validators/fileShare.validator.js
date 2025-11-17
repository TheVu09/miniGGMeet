const { body, param } = require('express-validator')

const meetingIdValidation = [
  param('meetingId')
    .notEmpty().withMessage('Meeting ID là bắt buộc')
    .isMongoId().withMessage('Meeting ID không hợp lệ')
]

const fileIdValidation = [
  param('fileId')
    .notEmpty().withMessage('File ID là bắt buộc')
    .isMongoId().withMessage('File ID không hợp lệ')
]

module.exports = {
  meetingIdValidation,
  fileIdValidation
}
