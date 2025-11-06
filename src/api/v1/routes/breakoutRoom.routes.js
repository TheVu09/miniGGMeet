const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const {
  createBreakoutRoomsValidation,
  meetingIdValidation,
  roomIdValidation,
  assignParticipantValidation,
  broadcastValidation
} = require('../validators/breakoutRoom.validator')
const {
  createBreakoutRooms,
  assignParticipant,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  getMeetingBreakoutRooms,
  startBreakoutRooms,
  closeBreakoutRoom,
  closeAllBreakoutRooms,
  broadcastToBreakoutRooms
} = require('../controllers/breakout/breakoutRoom.controller')

// POST /api/v1/breakout/meeting/:meetingId/create - Create breakout rooms
router.post('/meeting/:meetingId/create', requireAuth, meetingIdValidation, createBreakoutRoomsValidation, validate, createBreakoutRooms)

// GET /api/v1/breakout/meeting/:meetingId - Get breakout rooms
router.get('/meeting/:meetingId', requireAuth, meetingIdValidation, validate, getMeetingBreakoutRooms)

// POST /api/v1/breakout/meeting/:meetingId/start - Start breakout rooms
router.post('/meeting/:meetingId/start', requireAuth, meetingIdValidation, validate, startBreakoutRooms)

// POST /api/v1/breakout/meeting/:meetingId/close-all - Close all breakout rooms
router.post('/meeting/:meetingId/close-all', requireAuth, meetingIdValidation, validate, closeAllBreakoutRooms)

// POST /api/v1/breakout/meeting/:meetingId/broadcast - Broadcast message
router.post('/meeting/:meetingId/broadcast', requireAuth, meetingIdValidation, broadcastValidation, validate, broadcastToBreakoutRooms)

// POST /api/v1/breakout/room/:roomId/assign - Assign participant
router.post('/room/:roomId/assign', requireAuth, roomIdValidation, assignParticipantValidation, validate, assignParticipant)

// POST /api/v1/breakout/room/:roomId/join - Join room
router.post('/room/:roomId/join', requireAuth, roomIdValidation, validate, joinBreakoutRoom)

// POST /api/v1/breakout/room/:roomId/leave - Leave room
router.post('/room/:roomId/leave', requireAuth, roomIdValidation, validate, leaveBreakoutRoom)

// POST /api/v1/breakout/room/:roomId/close - Close specific room
router.post('/room/:roomId/close', requireAuth, roomIdValidation, validate, closeBreakoutRoom)

module.exports = router
