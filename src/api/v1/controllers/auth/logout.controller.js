const ApiResponse = require('../../../../utils/response.util')

exports.logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err)
      }
      res.clearCookie('connect.sid')
      return ApiResponse.success(res, null, 'Đăng xuất thành công')
    })
  } catch (error) {
    next(error)
  }
}
