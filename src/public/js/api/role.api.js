// Role Permission API Client
const roleAPI = {
  /**
   * Assign role to user
   */
  async assignRole(meetingId, targetUserId, role, customPermissions = null) {
    const response = await fetch(`/api/v1/roles/meeting/${meetingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, role, customPermissions })
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to assign role')
    }
    return data.data
  },

  /**
   * Get all roles in meeting
   */
  async getMeetingRoles(meetingId) {
    const response = await fetch(`/api/v1/roles/meeting/${meetingId}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch roles')
    }
    return data.data
  },

  /**
   * Get my role
   */
  async getMyRole(meetingId) {
    const response = await fetch(`/api/v1/roles/meeting/${meetingId}/my-role`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch role')
    }
    return data.data
  },

  /**
   * Update permissions
   */
  async updatePermissions(meetingId, targetUserId, permissions) {
    const response = await fetch(`/api/v1/roles/meeting/${meetingId}/user/${targetUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to update permissions')
    }
    return data.data
  },

  /**
   * Remove role
   */
  async removeRole(meetingId, targetUserId) {
    const response = await fetch(`/api/v1/roles/meeting/${meetingId}/user/${targetUserId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to remove role')
    }
    return data.data
  }
}

window.roleAPI = roleAPI
