// User validation rules
const { body, param } = require('express-validator')

exports.sendFriendRequestValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
]

exports.friendRequestActionValidation = [
  body('requesterId')
    .notEmpty()
    .withMessage('Requester ID is required')
    .isMongoId()
    .withMessage('Invalid requester ID')
]

exports.removeFriendValidation = [
  param('friendId')
    .notEmpty()
    .withMessage('Friend ID is required')
    .isMongoId()
    .withMessage('Invalid friend ID')
]
