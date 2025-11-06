// Device Status API Client
const deviceStatusAPI = {
  /**
   * Update device status
   */
  async updateStatus(meetingId, statusData) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to update status')
    }
    return data.data
  },

  /**
   * Get all device statuses in meeting
   */
  async getMeetingStatuses(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch statuses')
    }
    return data.data
  },

  /**
   * Get my device status
   */
  async getMyStatus(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}/my-status`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch status')
    }
    return data.data
  },

  /**
   * Toggle mute
   */
  async toggleMute(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}/toggle-mute`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to toggle mute')
    }
    return data.data
  },

  /**
   * Toggle video
   */
  async toggleVideo(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}/toggle-video`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to toggle video')
    }
    return data.data
  },

  /**
   * Toggle screen share
   */
  async toggleScreenShare(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}/toggle-screen-share`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to toggle screen share')
    }
    return data.data
  },

  /**
   * Toggle hand raise
   */
  async toggleHandRaise(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}/toggle-hand`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to toggle hand')
    }
    return data.data
  },

  /**
   * Mute all participants (host only)
   */
  async muteAll(meetingId) {
    const response = await fetch(`/api/v1/devices/meeting/${meetingId}/mute-all`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to mute all')
    }
    return data.data
  }
}

window.deviceStatusAPI = deviceStatusAPI
