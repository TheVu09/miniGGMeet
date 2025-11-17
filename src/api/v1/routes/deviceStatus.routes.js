const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const {
  updateDeviceStatus,
  getMeetingDeviceStatuses,
  getUserDeviceStatus,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  toggleHandRaise,
  muteAll
} = require('../controllers/devices/deviceStatus.controller')

// PUT /api/v1/devices/meeting/:meetingId - Update device status
router.put('/meeting/:meetingId', requireAuth, updateDeviceStatus)

// GET /api/v1/devices/meeting/:meetingId - Get all device statuses in meeting
router.get('/meeting/:meetingId', requireAuth, getMeetingDeviceStatuses)

// GET /api/v1/devices/meeting/:meetingId/my-status - Get user's device status
router.get('/meeting/:meetingId/my-status', requireAuth, getUserDeviceStatus)

// POST /api/v1/devices/meeting/:meetingId/toggle-mute - Toggle mute
router.post('/meeting/:meetingId/toggle-mute', requireAuth, toggleMute)

// POST /api/v1/devices/meeting/:meetingId/toggle-video - Toggle video
router.post('/meeting/:meetingId/toggle-video', requireAuth, toggleVideo)

// POST /api/v1/devices/meeting/:meetingId/toggle-screen-share - Toggle screen share
router.post('/meeting/:meetingId/toggle-screen-share', requireAuth, toggleScreenShare)

// POST /api/v1/devices/meeting/:meetingId/toggle-hand - Toggle hand raise
router.post('/meeting/:meetingId/toggle-hand', requireAuth, toggleHandRaise)

// POST /api/v1/devices/meeting/:meetingId/mute-all - Mute all participants (host only)
router.post('/meeting/:meetingId/mute-all', requireAuth, muteAll)

module.exports = router
