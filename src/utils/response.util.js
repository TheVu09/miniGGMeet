// Standard API response wrapper
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201)
  }

  static noContent(res, message = 'No content') {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    })
  }
}

module.exports = ApiResponse
