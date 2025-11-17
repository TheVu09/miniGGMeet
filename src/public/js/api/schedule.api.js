// Meeting Schedule API Client
const scheduleAPI = {
  /**
   * Create schedule
   */
  async createSchedule(scheduleData) {
    try {
      const response = await fetch('/api/v1/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      })
      const data = await response.json()
      if (!data.success) {
        console.error('Schedule creation failed:', data);
        throw new Error(data.message || 'Failed to create schedule')
      }
      return data.data
    } catch (error) {
      console.error('Schedule creation error:', error, scheduleData);
      throw error
    }
  },

  /**
   * Get user schedules
   */
  async getSchedules(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/v1/schedules?${params}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch schedules')
    }
    return data.data
  },

  /**
   * Get upcoming schedules
   */
  async getUpcoming() {
    const response = await fetch('/api/v1/schedules/upcoming')
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch upcoming schedules')
    }
    return data.data
  },

  /**
   * Get schedule by ID
   */
  async getScheduleById(scheduleId) {
    const response = await fetch(`/api/v1/schedules/${scheduleId}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch schedule')
    }
    return data.data
  },

  /**
   * Update schedule
   */
  async updateSchedule(scheduleId, updateData) {
    const response = await fetch(`/api/v1/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to update schedule')
    }
    return data.data
  },

  /**
   * Cancel schedule
   */
  async cancelSchedule(scheduleId, reason = '') {
    const response = await fetch(`/api/v1/schedules/${scheduleId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancellationReason: reason })
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to cancel schedule')
    }
    return data.data
  },

  /**
   * Respond to invitation
   */
  async respondToInvitation(scheduleId, response) {
    const res = await fetch(`/api/v1/schedules/${scheduleId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response })
    })
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to respond')
    }
    return data.data
  }
}

window.scheduleAPI = scheduleAPI
