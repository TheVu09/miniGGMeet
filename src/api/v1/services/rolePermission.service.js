const RolePermission = require('../../../models/RolePermission')
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Assign role to user
 */
async function assignRole(meetingId, userId, targetUserId, role, customPermissions = null) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Check if assigner is host or has canManageRoles permission
  if (meeting.host.toString() !== userId.toString()) {
    const assignerRole = await RolePermission.findOne({ meeting: meetingId, user: userId })
    if (!assignerRole || !assignerRole.permissions.canManageRoles) {
      throw new ForbiddenError('You do not have permission to assign roles')
    }
  }
  
  // Check if target user is participant
  if (!meeting.participants.includes(targetUserId) && meeting.host.toString() !== targetUserId.toString()) {
    throw new ValidationError('Target user is not a participant of this meeting')
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
  
  // Apply custom permissions if provided
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
 * Get user role and permissions in meeting
 */
async function getUserRole(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Check if user is host
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
    // Default participant role
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
 * Get all roles in meeting
 */
async function getMeetingRoles(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Check if user is participant
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not a participant of this meeting')
  }
  
  const roles = await RolePermission.find({ meeting: meetingId })
    .populate('user', 'displayName email')
    .populate('assignedBy', 'displayName email')
    .sort({ assignedAt: -1 })
  
  return roles
}

/**
 * Update custom permissions
 */
async function updatePermissions(meetingId, userId, targetUserId, permissions) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Check if updater is host or has canManageRoles permission
  if (meeting.host.toString() !== userId.toString()) {
    const updaterRole = await RolePermission.findOne({ meeting: meetingId, user: userId })
    if (!updaterRole || !updaterRole.permissions.canManageRoles) {
      throw new ForbiddenError('You do not have permission to update permissions')
    }
  }
  
  const rolePermission = await RolePermission.findOne({ meeting: meetingId, user: targetUserId })
  if (!rolePermission) {
    throw new NotFoundError('Role not found for this user')
  }
  
  Object.assign(rolePermission.permissions, permissions)
  await rolePermission.save()
  
  return await rolePermission.populate('user', 'displayName email')
}

/**
 * Remove role (reset to participant)
 */
async function removeRole(meetingId, userId, targetUserId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Only host can remove roles
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the host can remove roles')
  }
  
  // Cannot remove host role
  if (meeting.host.toString() === targetUserId.toString()) {
    throw new ValidationError('Cannot remove host role')
  }
  
  await RolePermission.findOneAndDelete({ meeting: meetingId, user: targetUserId })
  
  return { message: 'Role removed successfully' }
}

/**
 * Check permission
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
