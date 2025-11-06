const express = require('express')
const router = express.Router()
const User = require('../../../models/User')
const MeetingRoom = require('../../../models/MeetingRoom')

/**
 * VIEW ROUTES
 * These routes only render EJS templates (Server-Side Rendering)
 * All POST actions use REST API at /api/v1/*
 */

// ============================================
// PUBLIC PAGES
// ============================================

// Home page
router.get('/', (req, res) => {
	const user = req.session.user || null
	res.render('index', { user })
})

// Auth pages
router.get('/auth/login', (req, res) => {
	res.render('auth-login')
})

router.get('/auth/register', (req, res) => {
	res.render('auth-register')
})

// ============================================
// AUTHENTICATED PAGES
// ============================================

// Middleware to check authentication
const requireAuth = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/auth/login')
	}
	next()
}

// Friends page
router.get('/friends', requireAuth, async (req, res) => {
	try {
		const user = req.session.user
		const me = await User.findById(user.id)
			.populate('friendRequests', 'displayName email')
			.populate('friends', 'displayName email')
		res.render('friends', { user, me })
	} catch (error) {
		console.error('Error loading friends page:', error)
		res.status(500).send('Server error')
	}
})

// Meeting room view
router.get('/meeting/:code', requireAuth, async (req, res) => {
	try {
		const user = req.session.user
		const code = req.params.code

		// First check regular meeting rooms
		let room = await MeetingRoom.findOne({ code, isActive: true })

		// If not found, check breakout rooms
		if (!room) {
			const BreakoutRoom = require('../../../models/BreakoutRoom')
			const breakoutRoom = await BreakoutRoom.findOne({
				roomCode: code,
				status: { $in: ['created', 'active'] }
			}).populate('parentMeeting')

			if (!breakoutRoom) {
				return res.status(404).send('Phòng họp không tồn tại')
			}

			// Create a compatible room object for the view
			room = {
				_id: breakoutRoom._id,
				code: breakoutRoom.roomCode,
				title: breakoutRoom.roomName,
				capacity: breakoutRoom.capacity,
				host: breakoutRoom.parentMeeting.host,
				isBreakoutRoom: true,
				parentMeeting: breakoutRoom.parentMeeting._id
			}
		}

		res.render('meeting', { user, room })
	} catch (error) {
		console.error('Error loading meeting page:', error)
		res.status(500).send('Server error')
	}
})

// DM (Direct Message) 1:1 page
router.get('/dm/:roomId', requireAuth, (req, res) => {
	const user = req.session.user
	res.render('dm', { user, roomId: req.params.roomId })
})

// Schedules page
router.get('/schedules', requireAuth, (req, res) => {
	const user = req.session.user
	res.render('schedules', { user })
})

// Breakout rooms management page
router.get('/breakout', requireAuth, (req, res) => {
	const user = req.session.user
	const meetingCode = req.query.meeting || ''
	res.render('breakout', { user, meetingCode })
})

module.exports = router
