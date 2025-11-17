// Validation middleware using express-validator
const { validationResult } = require('express-validator')
const { ValidationError } = require('../../../utils/error.util')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }))
    
    throw new ValidationError('Validation failed', details)
  }
  
  next()
}

module.exports = { validate }
