const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.endMeeting = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { code } = req.params
    
    await meetingService.endMeeting(userId, code)
    
    return ApiResponse.success(res, null, 'Cuộc họp đã kết thúc thành công')
  } catch (error) {
    next(error)
  }
}
