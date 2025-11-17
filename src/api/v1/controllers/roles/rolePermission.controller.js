const rolePermissionService = require('../../services/rolePermission.service')
const ApiResponse = require('../../../../utils/response.util')

async function assignRole(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    const { targetUserId, role, customPermissions } = req.body
    
    const rolePermission = await rolePermissionService.assignRole(
      meetingId,
      userId,
      targetUserId,
      role,
      customPermissions
    )
    
    res.json(ApiResponse.success(rolePermission, 'Phân quyền thành công'))
  } catch (error) {
    next(error)
  }
}

async function getUserRole(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const role = await rolePermissionService.getUserRole(meetingId, userId)
    
    res.json(ApiResponse.success(role, 'Lấy vai trò thành công'))
  } catch (error) {
    next(error)
  }
}

async function getMeetingRoles(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const roles = await rolePermissionService.getMeetingRoles(meetingId, userId)
    
    res.json(ApiResponse.success(roles, 'Lấy danh sách vai trò thành công'))
  } catch (error) {
    next(error)
  }
}

async function updatePermissions(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId, targetUserId } = req.params
    const { permissions } = req.body
    
    const rolePermission = await rolePermissionService.updatePermissions(
      meetingId,
      userId,
      targetUserId,
      permissions
    )
    
    res.json(ApiResponse.success(rolePermission, 'Cập nhật quyền thành công'))
  } catch (error) {
    next(error)
  }
}

async function removeRole(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId, targetUserId } = req.params
    
    const result = await rolePermissionService.removeRole(meetingId, userId, targetUserId)
    
    res.json(ApiResponse.success(result, 'Xóa vai trò thành công'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  assignRole,
  getUserRole,
  getMeetingRoles,
  updatePermissions,
  removeRole
}
