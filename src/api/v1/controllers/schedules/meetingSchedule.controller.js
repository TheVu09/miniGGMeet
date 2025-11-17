const meetingScheduleService = require('../../services/meetingSchedule.service')
const ApiResponse = require('../../../../utils/response.util')

async function createSchedule(req, res, next) {
  try {
    const userId = req.session.user.id
    const scheduleData = req.body
    
    const schedule = await meetingScheduleService.createSchedule(userId, scheduleData)
    
    return ApiResponse.created(res, schedule, 'Tao lịch họp thành công')
  } catch (error) {
    next(error)
  }
}

async function getUserSchedules(req, res, next) {
  try {
    const userId = req.session.user.id
    const { status, startDate, endDate } = req.query
    
    const schedules = await meetingScheduleService.getUserSchedules(userId, {
      status,
      startDate,
      endDate
    })
    
    return ApiResponse.success(res, schedules, 'Lấy lịch họp thành công')
  } catch (error) {
    next(error)
  }
}

async function getScheduleById(req, res, next) {
  try {
    const userId = req.session.user.id
    const { scheduleId } = req.params
    
    const schedule = await meetingScheduleService.getScheduleById(scheduleId, userId)
    
    return ApiResponse.success(res, schedule, 'Lấy lịch họp thành công')
  } catch (error) {
    next(error)
  }
}

async function updateSchedule(req, res, next) {
  try {
    const userId = req.session.user.id
    const { scheduleId } = req.params
    const updateData = req.body
    
    const schedule = await meetingScheduleService.updateSchedule(scheduleId, userId, updateData)
    
    return ApiResponse.success(res, schedule, 'Cập nhật lịch họp thành công')
  } catch (error) {
    next(error)
  }
}

async function cancelSchedule(req, res, next) {
  try {
    const userId = req.session.user.id
    const { scheduleId } = req.params
    const { cancellationReason } = req.body
    
    const schedule = await meetingScheduleService.cancelSchedule(scheduleId, userId, cancellationReason)
    
    return ApiResponse.success(res, schedule, 'Hủy lịch họp thành công')
  } catch (error) {
    next(error)
  }
}

async function respondToInvitation(req, res, next) {
  try {
    const userId = req.session.user.id
    const { scheduleId } = req.params
    const { response } = req.body // 'accepted', 'declined', 'tentative'
    
    const schedule = await meetingScheduleService.respondToInvitation(scheduleId, userId, response)
    
    return ApiResponse.success(res, schedule, 'Phản hồi lời mời thành công')
  } catch (error) {
    next(error)
  }
}

async function getUpcomingSchedules(req, res, next) {
  try {
    const userId = req.session.user.id
    
    const schedules = await meetingScheduleService.getUpcomingSchedules(userId)
    
    return ApiResponse.success(res, schedules, 'Lấy lịch họp sắp tới thành công')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createSchedule,
  getUserSchedules,
  getScheduleById,
  updateSchedule,
  cancelSchedule,
  respondToInvitation,
  getUpcomingSchedules
}
