const authService = require('../../services/auth.service')
const ApiResponse = require('../../../../utils/response.util')

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id
    const user = await authService.getUserById(userId)
    
    return ApiResponse.success(res, { user }, 'Lấy thông tin người dùng thành công')
  } catch (error) {
    next(error)
  }
}