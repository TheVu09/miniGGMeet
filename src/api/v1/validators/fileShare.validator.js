const { body, param } = require('express-validator')

const meetingIdValidation = [
  param('meetingId')
    .notEmpty().withMessage('Meeting ID is required')
    .isMongoId().withMessage('Invalid meeting ID')
]

const fileIdValidation = [
  param('fileId')
    .notEmpty().withMessage('File ID is required')
    .isMongoId().withMessage('Invalid file ID')
]

module.exports = {
  meetingIdValidation,
  fileIdValidation
}
