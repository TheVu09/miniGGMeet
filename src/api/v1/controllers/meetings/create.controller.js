const meetingService = require('../../services/meeting.service')
const ApiResponse = require('../../../../utils/response.util')

exports.createMeeting = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.session?.user?.id
    
    console.log(' Create meeting request:', {
      hasReqUser: !!req.user,
      hasSessionUser: !!req.session?.user,
      userId,
      body: req.body
    })
    
    if (!userId) {
      throw new Error('User ID not found in request')
    }
    
    const { title, capacity } = req.body
    
    const meeting = await meetingService.createMeeting(userId, { title, capacity })
    
    return ApiResponse.created(res, { meeting }, 'Cuộc họp được tạo thành công')
  } catch (error) {
    console.error(' Error creating meeting:', error)
    next(error)
  }
}
