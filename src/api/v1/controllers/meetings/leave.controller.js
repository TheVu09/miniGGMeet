// Leave Meeting Controller
const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.leaveMeeting = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { code } = req.params
    
    await meetingService.leaveMeeting(userId, code)
    
    return ApiResponse.success(res, null, 'Left meeting successfully')
  } catch (error) {
    next(error)
  }
}
