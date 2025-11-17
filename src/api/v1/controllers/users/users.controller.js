const userService = require('../../services/user.service')
const ApiResponse = require('../../../../utils/response.util')

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const user = await userService.getUserById(userId)
    
    return ApiResponse.success(res, { user })
  } catch (error) {
    next(error)
  }
}
