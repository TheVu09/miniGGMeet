// Meeting validation rules
const { body, param } = require('express-validator')

exports.createMeetingValidation = [
  body('title')
    .notEmpty()
    .withMessage('Cuộc họp tiêu đề là bắt buộc')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tiêu đề cuộc họp phải từ 3 đến 100 ký tự'),
  
  body('capacity')
    .optional()
    .isInt({ min: 2, max: 250 })
    .withMessage('Sức chứa phải từ 2 đến 250 người')
]

exports.meetingCodeValidation = [
  param('code')
    .notEmpty()
    .withMessage('Mã cuộc họp là bắt buộc')
    .isLength({ min: 6, max: 10 })
    .withMessage('Định dạng mã cuộc họp không hợp lệ')
]
