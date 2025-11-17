// Authentication Service - Business Logic
const bcrypt = require('bcryptjs')
const User = require('../../../models/User')
const { UnauthorizedError, ConflictError, NotFoundError } = require('../../../utils/error.util')

class AuthService {
  async register(userData) {
    const { email, displayName, password } = userData

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      email,
      displayName,
      password: hashedPassword
    })

    // Return user without password
    return this.sanitizeUser(user)
  }

  async login(email, password) {
    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Return user without password
    return this.sanitizeUser(user)
  }

  async getUserById(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return this.sanitizeUser(user)
  }

  sanitizeUser(user) {
    const userObj = user.toObject()
    delete userObj.password
    return userObj
  }
}

module.exports = new AuthService()
