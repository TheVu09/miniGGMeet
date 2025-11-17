const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')

const {
  getProfile
} = require('../controllers/users/users.controller')

// GET /api/v1/users/me - Get current user profile
router.get('/me', requireAuth, getProfile)

module.exports = router
