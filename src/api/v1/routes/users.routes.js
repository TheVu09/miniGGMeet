// User routes
const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const { 
  sendFriendRequestValidation,
  friendRequestActionValidation,
  removeFriendValidation 
} = require('../validators/user.validator')

const {
  getProfile,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} = require('../controllers/users/users.controller')

// GET /api/v1/users/me - Get current user profile
router.get('/me', requireAuth, getProfile)

// GET /api/v1/users/friends - Get friends list
router.get('/friends', requireAuth, getFriends)

// GET /api/v1/users/friend-requests - Get friend requests
router.get('/friend-requests', requireAuth, getFriendRequests)

// POST /api/v1/users/friend-requests - Send friend request
router.post('/friend-requests', requireAuth, sendFriendRequestValidation, validate, sendFriendRequest)

// POST /api/v1/users/friend-requests/accept - Accept friend request
router.post('/friend-requests/accept', requireAuth, friendRequestActionValidation, validate, acceptFriendRequest)

// POST /api/v1/users/friend-requests/reject - Reject friend request
router.post('/friend-requests/reject', requireAuth, friendRequestActionValidation, validate, rejectFriendRequest)

// DELETE /api/v1/users/friends/:friendId - Remove friend
router.delete('/friends/:friendId', requireAuth, removeFriendValidation, validate, removeFriend)

module.exports = router
