const { body, param } = require('express-validator')

const createBreakoutRoomsValidation = [
  body('numberOfRooms')
    .notEmpty().withMessage('Số phòng là bắt buộc')
    .isInt({ min: 2, max: 50 }).withMessage('Số phòng phải từ 2 đến 50'),
  body('assignmentType')
    .optional()
    .isIn(['manual', 'random', 'self-select']).withMessage('Loại phân công không hợp lệ'),
  body('capacity')
    .optional()
    .isInt({ min: 2, max: 50 }).withMessage('Sức chứa phải từ 2 đến 50')
]

const meetingIdValidation = [
  param('meetingId')
    .notEmpty().withMessage('Meeting ID là bắt buộc')
    .isMongoId().withMessage('Meeting ID không hợp lệ')
]

const roomIdValidation = [
  param('roomId')
    .notEmpty().withMessage('Room ID là bắt buộc')
    .isMongoId().withMessage('Room ID không hợp lệ')
]

const assignParticipantValidation = [
  body('participantId')
    .notEmpty().withMessage('Participant ID là bắt buộc')
    .isMongoId().withMessage('Participant ID không hợp lệ')
]

const broadcastValidation = [
  body('message')
    .notEmpty().withMessage('Tin nhắn là bắt buộc')
    .isLength({ max: 500 }).withMessage('Tin nhắn không được vượt quá 500 ký tự')
]

module.exports = {
  createBreakoutRoomsValidation,
  meetingIdValidation,
  roomIdValidation,
  assignParticipantValidation,
  broadcastValidation
}
