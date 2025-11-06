// Auth routes
const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const { loginValidation, registerValidation } = require('../validators/auth.validator')

const { login } = require('../controllers/auth/login.controller')
const { register } = require('../controllers/auth/register.controller')
const { logout } = require('../controllers/auth/logout.controller')
const { getMe } = require('../controllers/auth/getMe.controller')

// POST /api/v1/auth/login
router.post('/login', loginValidation, validate, login)

// POST /api/v1/auth/register
router.post('/register', registerValidation, validate, register)

// POST /api/v1/auth/logout
router.post('/logout', requireAuth, logout)

// GET /api/v1/auth/me
router.get('/me', requireAuth, getMe)

module.exports = router
