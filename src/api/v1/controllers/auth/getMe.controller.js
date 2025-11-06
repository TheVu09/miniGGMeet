// Get Current User Controller
const authService = require('../../services/auth.service')
const ApiResponse = require('../../../../utils/response.util')

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id
    const user = await authService.getUserById(userId)
    
    return ApiResponse.success(res, { user }, 'User retrieved successfully')
  } catch (error) {
    next(error)
  }
}
