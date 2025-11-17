const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.joinMeeting = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { code } = req.params
    
    const meeting = await meetingService.joinMeeting(userId, code)
    
    return ApiResponse.success(res, { meeting }, 'Tham gia cuộc họp thành công')
  } catch (error) {
    next(error)
  }
}
