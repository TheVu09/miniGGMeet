// Get Meeting Details Controller
const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.getMeeting = async (req, res, next) => {
  try {
    const { code } = req.params
    
    const meeting = await meetingService.getMeetingByCode(code)
    
    return ApiResponse.success(res, { meeting }, 'Meeting retrieved successfully')
  } catch (error) {
    next(error)
  }
}
