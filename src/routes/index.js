const express = require('express')
const router = express.Router()
const MeetingController = require('../app/controllers/MeetingController')
const FriendController = require('../app/controllers/FriendController')
const AuthController = require('../app/controllers/AuthController')

// Trang chủ và đăng nhập nhanh
router.get('/', MeetingController.home)
router.post('/login', MeetingController.login)

// Auth pages
router.get('/auth/login', AuthController.loginPage)
router.post('/auth/login', AuthController.login)
router.get('/auth/register', AuthController.registerPage)
router.post('/auth/register', AuthController.register)
router.post('/auth/logout', AuthController.logout)

// (Đã bỏ tính năng máy chủ)

// Bạn bè
router.get('/friends', FriendController.list)
router.post('/friends/request', FriendController.request)
router.post('/friends/accept', FriendController.accept)

// Phòng họp
router.post('/meeting/create', MeetingController.createMeeting)
router.get('/meeting/:code', MeetingController.viewMeeting)

// DM 1:1
router.get('/dm/:roomId', (req, res) => {
	const user = req.session.user
	if (!user) return res.redirect('/')
	res.render('dm', { user, roomId: req.params.roomId })
})

module.exports = router
