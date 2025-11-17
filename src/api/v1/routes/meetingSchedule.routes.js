const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const {
  scheduleValidation,
  scheduleIdValidation,
  respondValidation
} = require('../validators/meetingSchedule.validator')
const {
  createSchedule,
  getUserSchedules,
  getScheduleById,
  updateSchedule,
  cancelSchedule,
  respondToInvitation,
  getUpcomingSchedules
} = require('../controllers/schedules/meetingSchedule.controller')

// POST /api/v1/schedules - Create schedule
router.post('/', requireAuth, scheduleValidation, validate, createSchedule)

// GET /api/v1/schedules - Get user schedules
router.get('/', requireAuth, getUserSchedules)

// GET /api/v1/schedules/upcoming - Get upcoming schedules
router.get('/upcoming', requireAuth, getUpcomingSchedules)

// GET /api/v1/schedules/:scheduleId - Get schedule by ID
router.get('/:scheduleId', requireAuth, scheduleIdValidation, validate, getScheduleById)

// PUT /api/v1/schedules/:scheduleId - Update schedule
router.put('/:scheduleId', requireAuth, scheduleIdValidation, validate, updateSchedule)

// POST /api/v1/schedules/:scheduleId/cancel - Cancel schedule
router.post('/:scheduleId/cancel', requireAuth, scheduleIdValidation, validate, cancelSchedule)

// POST /api/v1/schedules/:scheduleId/respond - Respond to invitation
router.post('/:scheduleId/respond', requireAuth, scheduleIdValidation, respondValidation, validate, respondToInvitation)

module.exports = router
