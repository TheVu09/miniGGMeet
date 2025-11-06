// Meeting routes
const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const { createMeetingValidation, meetingCodeValidation } = require('../validators/meeting.validator')

const { createMeeting } = require('../controllers/meetings/create.controller')
const { joinMeeting } = require('../controllers/meetings/join.controller')
const { getMeeting } = require('../controllers/meetings/get.controller')
const { listMeetings } = require('../controllers/meetings/list.controller')
const { endMeeting } = require('../controllers/meetings/end.controller')
const { leaveMeeting } = require('../controllers/meetings/leave.controller')

// POST /api/v1/meetings - Create new meeting
router.post('/', requireAuth, createMeetingValidation, validate, createMeeting)

// GET /api/v1/meetings - List user's meetings
router.get('/', requireAuth, listMeetings)

// GET /api/v1/meetings/:code - Get meeting details
router.get('/:code', requireAuth, meetingCodeValidation, validate, getMeeting)

// POST /api/v1/meetings/:code/join - Join meeting
router.post('/:code/join', requireAuth, meetingCodeValidation, validate, joinMeeting)

// DELETE /api/v1/meetings/:code - End meeting
router.delete('/:code', requireAuth, meetingCodeValidation, validate, endMeeting)

// POST /api/v1/meetings/:code/leave - Leave meeting
router.post('/:code/leave', requireAuth, meetingCodeValidation, validate, leaveMeeting)

module.exports = router
