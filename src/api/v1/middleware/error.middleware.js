const { ApiError } = require('../../../utils/error.util')

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let code = err.code || 'INTERNAL_ERROR'

  if (err.name === 'ValidationError') {
    statusCode = 422
    code = 'VALIDATION_ERROR'
    message = 'Validation failed'
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }))
    return res.status(statusCode).json({
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString()
    })
  }

  if (err.code === 11000) {
    statusCode = 409
    code = 'DUPLICATE_ERROR'
    const field = Object.keys(err.keyPattern)[0]
    message = `${field} already exists`
  }

  if (err.name === 'CastError') {
    statusCode = 400
    code = 'INVALID_ID'
    message = `Invalid ${err.path}: ${err.value}`
  }

  if (process.env.NODE_ENV === 'development' || statusCode === 500) {
    console.error(' Error:', {
      code,
      message,
      stack: err.stack,
      details: err.details || err
    })
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? (err.details || err) : undefined,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  })
}

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    },
    timestamp: new Date().toISOString()
  })
}

module.exports = { errorHandler, notFound }
