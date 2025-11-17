const { body, param } = require('express-validator')

const scheduleValidation = [
  body('title')
    .notEmpty().withMessage('Tiêu đề là bắt buộc')
    .isLength({ max: 200 }).withMessage('Tiêu đề không được vượt quá 200 ký tự'),
  body('scheduledStartTime')
    .notEmpty().withMessage('Thời gian bắt đầu là bắt buộc')
    .isISO8601().withMessage('Định dạng ngày không hợp lệ'),
  body('scheduledEndTime')
    .notEmpty().withMessage('Thời gian kết thúc là bắt buộc')
    .isISO8601().withMessage('Định dạng ngày không hợp lệ'),
  body('duration')
    .notEmpty().withMessage('Thời lượng là bắt buộc')
    .isInt({ min: 5, max: 480 }).withMessage('Thời lượng phải từ 5 đến 480 phút')
]

const scheduleIdValidation = [
  param('scheduleId')
    .notEmpty().withMessage('Thời gian biểu là bắt buộc')
    .isMongoId().withMessage('ID thời gian biểu không hợp lệ')
]

const respondValidation = [
  body('response')
    .notEmpty().withMessage('Phản hồi là bắt buộc')
    .isIn(['accepted', 'declined', 'tentative']).withMessage('Phản hồi không hợp lệ')
]

module.exports = {
  scheduleValidation,
  scheduleIdValidation,
  respondValidation
}
