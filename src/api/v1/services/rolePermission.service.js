const RolePermission = require('../../../models/RolePermission')
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Cấp vai trò cho người dùng trong cuộc họp
 */
async function assignRole(meetingId, userId, targetUserId, role, customPermissions = null) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Cuộc họp không tồn tại')
  }
  
  // Kiểm tra nếu người gán vai trò là chủ trì hoặc có quyền canManageRoles
  if (meeting.host.toString() !== userId.toString()) {
    const assignerRole = await RolePermission.findOne({ meeting: meetingId, user: userId })
    if (!assignerRole || !assignerRole.permissions.canManageRoles) {
      throw new ForbiddenError('Bạn không có quyền cấp vai trò')
    }
  }
  
  // Kiểm tra nếu người dùng mục tiêu là người tham gia
  if (!meeting.participants.includes(targetUserId) && meeting.host.toString() !== targetUserId.toString()) {
    throw new ValidationError('Người dùng mục tiêu không phải là người tham gia cuộc họp này')
  }
  
  // Find or create role
  let rolePermission = await RolePermission.findOne({ meeting: meetingId, user: targetUserId })
  
  if (!rolePermission) {
    rolePermission = new RolePermission({
      meeting: meetingId,
      user: targetUserId,
      role,
      assignedBy: userId
    })
  } else {
    rolePermission.role = role
    rolePermission.assignedBy = userId
    rolePermission.assignedAt = new Date()
  }
  
  // Áp dụng quyền tùy chỉnh nếu được cung cấp
  if (customPermissions) {
    Object.assign(rolePermission.permissions, customPermissions)
  }
  
  await rolePermission.save()
  
  return await rolePermission.populate([
    { path: 'user', select: 'displayName email' },
    { path: 'assignedBy', select: 'displayName email' }
  ])
}

/**
 * Lấy vai trò và quyền của người dùng trong cuộc họp
 */
async function getUserRole(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Kiểm tra nếu người dùng là người tham gia
  if (meeting.host.toString() === userId.toString()) {
    return {
      role: 'host',
      permissions: {
        canStartMeeting: true,
        canEndMeeting: true,
        canLockMeeting: true,
        canAdmitParticipants: true,
        canRemoveParticipants: true,
        canMuteParticipants: true,
        canMuteAll: true,
        canShareScreen: true,
        canShareFiles: true,
        canShareWhiteboard: true,
        canSendChat: true,
        canSendPrivateChat: true,
        canDeleteMessages: true,
        canStartRecording: true,
        canStopRecording: true,
        canCreateBreakoutRooms: true,
        canAssignBreakoutRooms: true,
        canBroadcastToBreakoutRooms: true,
        canChangeSettings: true,
        canManageRoles: true,
        canInviteParticipants: true
      },
      isHost: true
    }
  }
  
  const rolePermission = await RolePermission.findOne({ meeting: meetingId, user: userId })
    .populate('user', 'displayName email')
  
  if (!rolePermission) {
    // Vai trò mặc định của người tham gia
    return {
      role: 'participant',
      permissions: {
        canShareFiles: true,
        canSendChat: true,
        canSendPrivateChat: true
      },
      isHost: false
    }
  }
  
  return {
    ...rolePermission.toObject(),
    isHost: false
  }
}

/**
 * Lấy tất cả vai trò trong cuộc họp
 */
async function getMeetingRoles(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Cuộc họp không tồn tại')
  }
  
  // Kiểm tra nếu người dùng là người tham gia
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Bạn không phải là người tham gia cuộc họp này')
  }
  
  const roles = await RolePermission.find({ meeting: meetingId })
    .populate('user', 'displayName email')
    .populate('assignedBy', 'displayName email')
    .sort({ assignedAt: -1 })
  
  return roles
}

/**
 * Cập nhật quyền tùy chỉnh
 */
async function updatePermissions(meetingId, userId, targetUserId, permissions) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Cuộc họp không tồn tại')
  }
  
  // Kiểm tra nếu người cập nhật là người tổ chức hoặc có quyền canManageRoles
  if (meeting.host.toString() !== userId.toString()) {
    const updaterRole = await RolePermission.findOne({ meeting: meetingId, user: userId })
    if (!updaterRole || !updaterRole.permissions.canManageRoles) {
      throw new ForbiddenError('Bạn không có quyền cập nhật quyền')
    }
  }
  
  const rolePermission = await RolePermission.findOne({ meeting: meetingId, user: targetUserId })
  if (!rolePermission) {
    throw new NotFoundError('Vai trò không tồn tại cho người dùng này')
  }
  
  Object.assign(rolePermission.permissions, permissions)
  await rolePermission.save()
  
  return await rolePermission.populate('user', 'displayName email')
}

/**
 * Xóa vai trò khỏi người dùng
 */
async function removeRole(meetingId, userId, targetUserId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Cuộc họp không tồn tại')
  }
  
  // Chỉ người tổ chức mới có thể xóa vai trò
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Chỉ người tổ chức mới có thể xóa vai trò')
  }
  
  // Không thể xóa vai trò của người tổ chức
  if (meeting.host.toString() === targetUserId.toString()) {
    throw new ValidationError('Không thể xóa vai trò của người tổ chức')
  }
  
  await RolePermission.findOneAndDelete({ meeting: meetingId, user: targetUserId })
  
  return { message: 'Xóa vai trò thành công' }
}

/**
 * Kiểm tra quyền
 */
async function checkPermission(meetingId, userId, permissionKey) {
  const userRole = await getUserRole(meetingId, userId)
  return userRole.permissions[permissionKey] === true
}

module.exports = {
  assignRole,
  getUserRole,
  getMeetingRoles,
  updatePermissions,
  removeRole,
  checkPermission
}
