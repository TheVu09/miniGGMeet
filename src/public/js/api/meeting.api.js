// Meeting API Client
class MeetingAPI {
  constructor() {
    this.baseURL = '/api/v1/meetings'
  }

  /**
   * Create new meeting
   * @param {string} title 
   * @param {number} capacity 
   * @returns {Promise<{meeting}>}
   */
  async createMeeting(title, capacity = 50) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, capacity })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to create meeting')
    }

    return data.data
  }

  /**
   * Get meeting by code
   * @param {string} code 
   * @returns {Promise<{meeting}>}
   */
  async getMeeting(code) {
    const response = await fetch(`${this.baseURL}/${code}`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get meeting')
    }

    return data.data
  }

  /**
   * Get user's meetings
   * @returns {Promise<{meetings: Array, count: number}>}
   */
  async listMeetings() {
    const response = await fetch(this.baseURL)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to list meetings')
    }

    return data.data
  }

  /**
   * Join meeting
   * @param {string} code 
   * @returns {Promise<void>}
   */
  async joinMeeting(code) {
    const response = await fetch(`${this.baseURL}/${code}/join`, {
      method: 'POST'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to join meeting')
    }

    return data
  }

  /**
   * End meeting
   * @param {string} code 
   * @returns {Promise<void>}
   */
  async endMeeting(code) {
    const response = await fetch(`${this.baseURL}/${code}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to end meeting')
    }

    return data
  }

  /**
   * Leave meeting
   * @param {string} code 
   * @returns {Promise<void>}
   */
  async leaveMeeting(code) {
    const response = await fetch(`${this.baseURL}/${code}/leave`, {
      method: 'POST'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to leave meeting')
    }

    return data
  }
}

// Export singleton instance
const meetingAPI = new MeetingAPI()
