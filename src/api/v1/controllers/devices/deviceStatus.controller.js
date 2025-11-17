const deviceStatusService = require('../../services/deviceStatus.service')
const ApiResponse = require('../../../../utils/response.util')

async function updateDeviceStatus(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    const statusData = req.body
    
    const deviceStatus = await deviceStatusService.updateDeviceStatus(meetingId, userId, statusData)
    
    res.json(ApiResponse.success(deviceStatus, 'Device status updated successfully'))
  } catch (error) {
    next(error)
  }
}

async function getMeetingDeviceStatuses(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const statuses = await deviceStatusService.getMeetingDeviceStatuses(meetingId, userId)
    
    res.json(ApiResponse.success(statuses, 'Device statuses retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

async function getUserDeviceStatus(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const status = await deviceStatusService.getUserDeviceStatus(meetingId, userId)
    
    res.json(ApiResponse.success(status, 'Device status retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

async function toggleMute(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const status = await deviceStatusService.toggleMute(meetingId, userId)
    
    res.json(ApiResponse.success(status, 'Mute status toggled'))
  } catch (error) {
    next(error)
  }
}

async function toggleVideo(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const status = await deviceStatusService.toggleVideo(meetingId, userId)
    
    res.json(ApiResponse.success(status, 'Video status toggled'))
  } catch (error) {
    next(error)
  }
}

async function toggleScreenShare(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const status = await deviceStatusService.toggleScreenShare(meetingId, userId)
    
    res.json(ApiResponse.success(status, 'Screen share status toggled'))
  } catch (error) {
    next(error)
  }
}

async function toggleHandRaise(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const status = await deviceStatusService.toggleHandRaise(meetingId, userId)
    
    res.json(ApiResponse.success(status, 'Hand raise status toggled'))
  } catch (error) {
    next(error)
  }
}

async function muteAll(req, res, next) {
  try {
    const hostId = req.session.user.id
    const { meetingId } = req.params
    
    const result = await deviceStatusService.muteAll(meetingId, hostId)
    
    res.json(ApiResponse.success(result, 'All participants muted'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  updateDeviceStatus,
  getMeetingDeviceStatuses,
  getUserDeviceStatus,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  toggleHandRaise,
  muteAll
}
