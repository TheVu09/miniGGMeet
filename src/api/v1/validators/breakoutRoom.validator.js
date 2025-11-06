const { body, param } = require('express-validator')

const createBreakoutRoomsValidation = [
  body('numberOfRooms')
    .notEmpty().withMessage('Number of rooms is required')
    .isInt({ min: 2, max: 50 }).withMessage('Number of rooms must be between 2 and 50'),
  body('assignmentType')
    .optional()
    .isIn(['manual', 'random', 'self-select']).withMessage('Invalid assignment type'),
  body('capacity')
    .optional()
    .isInt({ min: 2, max: 50 }).withMessage('Capacity must be between 2 and 50')
]

const meetingIdValidation = [
  param('meetingId')
    .notEmpty().withMessage('Meeting ID is required')
    .isMongoId().withMessage('Invalid meeting ID')
]

const roomIdValidation = [
  param('roomId')
    .notEmpty().withMessage('Room ID is required')
    .isMongoId().withMessage('Invalid room ID')
]

const assignParticipantValidation = [
  body('participantId')
    .notEmpty().withMessage('Participant ID is required')
    .isMongoId().withMessage('Invalid participant ID')
]

const broadcastValidation = [
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 500 }).withMessage('Message must not exceed 500 characters')
]

module.exports = {
  createBreakoutRoomsValidation,
  meetingIdValidation,
  roomIdValidation,
  assignParticipantValidation,
  broadcastValidation
}
