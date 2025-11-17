// API v1 routes aggregator
const express = require('express')
const router = express.Router()

// API Routes (REST API endpoints)
const authRoutes = require('./auth.routes')
const meetingRoutes = require('./meetings.routes')
const userRoutes = require('./users.routes')
const fileShareRoutes = require('./fileShare.routes')
const deviceStatusRoutes = require('./deviceStatus.routes')
const meetingScheduleRoutes = require('./meetingSchedule.routes')
const rolePermissionRoutes = require('./rolePermission.routes')
const breakoutRoomRoutes = require('./breakoutRoom.routes')

// Mount API routes under /api/v1
router.use('/auth', authRoutes)
router.use('/meetings', meetingRoutes)
router.use('/users', userRoutes)
router.use('/files', fileShareRoutes)
router.use('/devices', deviceStatusRoutes)
router.use('/schedules', meetingScheduleRoutes)
router.use('/roles', rolePermissionRoutes)
router.use('/breakout', breakoutRoomRoutes)

module.exports = router
