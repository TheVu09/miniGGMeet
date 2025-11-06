// Authentication middleware
const { UnauthorizedError } = require('../../../utils/error.util')

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    throw new UnauthorizedError('Please login to continue')
  }
  req.user = req.session.user
  next()
}

const optionalAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user
  }
  next()
}

module.exports = { requireAuth, optionalAuth }
