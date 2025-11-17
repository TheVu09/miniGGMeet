// Login Controller
const authService = require('../../services/auth.service')
const ApiResponse = require('../../../../utils/response.util')

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    // Call service
    const user = await authService.login(email, password)
    
    // Set session
    req.session.user = {
      id: user._id,
      email: user.email,
      displayName: user.displayName
    }
    
    return ApiResponse.success(res, { user }, 'Login successful')
  } catch (error) {
    next(error)
  }
}
