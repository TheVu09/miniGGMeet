const authService = require('../../services/auth.service')
const ApiResponse = require('../../../../utils/response.util')

exports.register = async (req, res, next) => {
  try {
    const { email, displayName, password } = req.body
    
    const user = await authService.register({ email, displayName, password })
    
    req.session.user = {
      id: user._id,
      email: user.email,
      displayName: user.displayName
    }
    
    return ApiResponse.created(res, { user }, 'Đăng ký thành công')
  } catch (error) {
    next(error)
  }
}
