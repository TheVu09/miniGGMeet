const meetingScheduleService = require('../../services/meetingSchedule.service')
const ApiResponse = require('../../../../utils/response.util')

async function createSchedule(req, res, next) {
  try {
    const userId = req.session.user.id
    const scheduleData = req.body
    
    const schedule = await meetingScheduleService.createSchedule(userId, scheduleData)
    
    res.status(201).json(ApiResponse.success(schedule, 'Meeting scheduled successfully'))
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
    
    res.json(ApiResponse.success(schedules, 'Schedules retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

async function getScheduleById(req, res, next) {
  try {
    const userId = req.session.user.id
    const { scheduleId } = req.params
    
    const schedule = await meetingScheduleService.getScheduleById(scheduleId, userId)
    
    res.json(ApiResponse.success(schedule, 'Schedule retrieved successfully'))
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
    
    res.json(ApiResponse.success(schedule, 'Schedule updated successfully'))
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
    
    res.json(ApiResponse.success(schedule, 'Schedule cancelled successfully'))
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
    
    res.json(ApiResponse.success(schedule, 'Response recorded successfully'))
  } catch (error) {
    next(error)
  }
}

async function getUpcomingSchedules(req, res, next) {
  try {
    const userId = req.session.user.id
    
    const schedules = await meetingScheduleService.getUpcomingSchedules(userId)
    
    res.json(ApiResponse.success(schedules, 'Upcoming schedules retrieved successfully'))
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
