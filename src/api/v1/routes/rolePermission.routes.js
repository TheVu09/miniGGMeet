const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const {
  assignRoleValidation,
  meetingIdValidation
} = require('../validators/rolePermission.validator')
const {
  assignRole,
  getUserRole,
  getMeetingRoles,
  updatePermissions,
  removeRole
} = require('../controllers/roles/rolePermission.controller')

// POST /api/v1/roles/meeting/:meetingId - Assign role
router.post('/meeting/:meetingId', requireAuth, meetingIdValidation, assignRoleValidation, validate, assignRole)

// GET /api/v1/roles/meeting/:meetingId - Get all roles in meeting
router.get('/meeting/:meetingId', requireAuth, meetingIdValidation, validate, getMeetingRoles)

// GET /api/v1/roles/meeting/:meetingId/my-role - Get user's role
router.get('/meeting/:meetingId/my-role', requireAuth, meetingIdValidation, validate, getUserRole)

// PUT /api/v1/roles/meeting/:meetingId/user/:targetUserId - Update permissions
router.put('/meeting/:meetingId/user/:targetUserId', requireAuth, meetingIdValidation, validate, updatePermissions)

// DELETE /api/v1/roles/meeting/:meetingId/user/:targetUserId - Remove role
router.delete('/meeting/:meetingId/user/:targetUserId', requireAuth, meetingIdValidation, validate, removeRole)

module.exports = router
