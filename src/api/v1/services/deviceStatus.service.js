const DeviceStatus = require('../../../models/DeviceStatus')
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Cập nhật trạng thái thiết bị của người dùng trong cuộc họp
 */
async function updateDeviceStatus(meetingId, userId, statusData) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Tìm kiếm trạng thái thiết bị hiện tại
  let deviceStatus = await DeviceStatus.findOne({ meeting: meetingId, user: userId })
  
  if (!deviceStatus) {
    deviceStatus = await DeviceStatus.create({
      meeting: meetingId,
      user: userId,
      ...statusData,
      lastUpdated: new Date()
    })
  } else {
    Object.assign(deviceStatus, statusData)
    deviceStatus.lastUpdated = new Date()
    await deviceStatus.save()
  }
  
  return await deviceStatus.populate('user', 'displayName email')
}

/**
 * Lấy trạng thái thiết bị của tất cả người tham gia trong cuộc họp
 */
async function getMeetingDeviceStatuses(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Kiểm tra nếu người dùng là người tham gia
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not a participant of this meeting')
  }
  
  const statuses = await DeviceStatus.find({ meeting: meetingId })
    .populate('user', 'displayName email')
    .sort({ lastUpdated: -1 })
  
  return statuses
}

/**
 * Lấy trạng thái thiết bị của một người dùng trong cuộc họp
 */
async function getUserDeviceStatus(meetingId, userId) {
  const deviceStatus = await DeviceStatus.findOne({ meeting: meetingId, user: userId })
    .populate('user', 'displayName email')
  
  if (!deviceStatus) {
    throw new NotFoundError('Device status not found')
  }
  
  return deviceStatus
}

/**
 * Chuyển đổi trạng thái tắt tiếng
 */
async function toggleMute(meetingId, userId) {
  const deviceStatus = await DeviceStatus.findOne({ meeting: meetingId, user: userId })
  if (!deviceStatus) {
    throw new NotFoundError('Device status not found')
  }
  
  deviceStatus.isMuted = !deviceStatus.isMuted
  deviceStatus.lastUpdated = new Date()
  await deviceStatus.save()
  
  return deviceStatus
}

/**
 * Chuyển đổi trạng thái video
 */
async function toggleVideo(meetingId, userId) {
  const deviceStatus = await DeviceStatus.findOne({ meeting: meetingId, user: userId })
  if (!deviceStatus) {
    throw new NotFoundError('Device status not found')
  }
  
  deviceStatus.isVideoOff = !deviceStatus.isVideoOff
  deviceStatus.lastUpdated = new Date()
  await deviceStatus.save()
  
  return deviceStatus
}

/**
 * Chuyển đổi trạng thái chia sẻ màn hình
 */
async function toggleScreenShare(meetingId, userId) {
  const deviceStatus = await DeviceStatus.findOne({ meeting: meetingId, user: userId })
  if (!deviceStatus) {
    throw new NotFoundError('Device status not found')
  }
  
  deviceStatus.isScreenSharing = !deviceStatus.isScreenSharing
  deviceStatus.screenShareStartedAt = deviceStatus.isScreenSharing ? new Date() : null
  deviceStatus.lastUpdated = new Date()
  await deviceStatus.save()
  
  return deviceStatus
}

/**
 * Chuyển đổi trạng thái giơ tay
 */
async function toggleHandRaise(meetingId, userId) {
  const deviceStatus = await DeviceStatus.findOne({ meeting: meetingId, user: userId })
  if (!deviceStatus) {
    throw new NotFoundError('Device status not found')
  }
  
  deviceStatus.handRaised = !deviceStatus.handRaised
  deviceStatus.handRaisedAt = deviceStatus.handRaised ? new Date() : null
  deviceStatus.lastUpdated = new Date()
  await deviceStatus.save()
  
  return deviceStatus
}

/**
 * Tắt tiếng tất cả người tham gia (chỉ chủ trì)
 */
async function muteAll(meetingId, hostId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  if (meeting.host.toString() !== hostId.toString()) {
    throw new ForbiddenError('Only the host can mute all participants')
  }
  
  const result = await DeviceStatus.updateMany(
    { meeting: meetingId, user: { $ne: hostId } },
    { isMuted: true, lastUpdated: new Date() }
  )
  
  return { modifiedCount: result.modifiedCount }
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
