// Create Meeting Controller
const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.createMeeting = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { title, capacity } = req.body
    
    const meeting = await meetingService.createMeeting(userId, { title, capacity })
    
    return ApiResponse.created(res, { meeting }, 'Meeting created successfully')
  } catch (error) {
    next(error)
  }
}
