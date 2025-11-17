// Logout Controller
const ApiResponse = require('../../../../utils/response.util')

exports.logout = async (req, res, next) => {
  try {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return next(err)
      }
      res.clearCookie('connect.sid')
      return ApiResponse.success(res, null, 'Logout successful')
    })
  } catch (error) {
    next(error)
  }
}
