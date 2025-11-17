// User validation rules
const { body, param } = require('express-validator')

exports.sendFriendRequestValidation = [
  body('email')
    .isEmail()
    .withMessage('Làm ơn cung cấp email hợp lệ')
    .normalizeEmail()
]

exports.friendRequestActionValidation = [
  body('requesterId')
    .notEmpty()
    .withMessage('ID người gửi yêu cầu là bắt buộc')
    .isMongoId()
    .withMessage('ID người gửi yêu cầu không hợp lệ')
]

exports.removeFriendValidation = [
  param('friendId')
    .notEmpty()
    .withMessage('ID bạn bè là bắt buộc')
    .isMongoId()
    .withMessage('ID bạn bè không hợp lệ')
]
