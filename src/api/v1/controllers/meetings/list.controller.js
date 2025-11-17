const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.listMeetings = async (req, res, next) => {
  try {
    const userId = req.user.id
    
    const meetings = await meetingService.getUserMeetings(userId)
    
    return ApiResponse.success(res, { meetings, count: meetings.length }, 'Cuộc họp được liệt kê thành công')
  } catch (error) {
    next(error)
  }
}
