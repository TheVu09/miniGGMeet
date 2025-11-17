// Breakout Room API Client
const breakoutAPI = {
  /**
   * Create breakout rooms
   */
  async createRooms(meetingId, numberOfRooms, assignmentType = 'manual', roomNames = [], capacity = 10) {
    const response = await fetch(`/api/v1/breakout/meeting/${meetingId}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numberOfRooms, assignmentType, roomNames, capacity })
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to create breakout rooms')
    }
    return data.data
  },

  /**
   * Get breakout rooms
   */
  async getRooms(meetingId) {
    const response = await fetch(`/api/v1/breakout/meeting/${meetingId}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch rooms')
    }
    return data.data
  },

  /**
   * Start breakout rooms
   */
  async startRooms(meetingId) {
    const response = await fetch(`/api/v1/breakout/meeting/${meetingId}/start`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to start rooms')
    }
    return data.data
  },

  /**
   * Close all breakout rooms
   */
  async closeAllRooms(meetingId) {
    const response = await fetch(`/api/v1/breakout/meeting/${meetingId}/close-all`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to close rooms')
    }
    return data.data
  },

  /**
   * Broadcast message to all rooms
   */
  async broadcast(meetingId, message) {
    const response = await fetch(`/api/v1/breakout/meeting/${meetingId}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to broadcast')
    }
    return data.data
  },

  /**
   * Assign participant to room
   */
  async assignParticipant(roomId, participantId) {
    const response = await fetch(`/api/v1/breakout/room/${roomId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId })
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to assign participant')
    }
    return data.data
  },

  /**
   * Join breakout room
   */
  async joinRoom(roomId) {
    const response = await fetch(`/api/v1/breakout/room/${roomId}/join`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to join room')
    }
    return data.data
  },

  /**
   * Leave breakout room
   */
  async leaveRoom(roomId) {
    const response = await fetch(`/api/v1/breakout/room/${roomId}/leave`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to leave room')
    }
    return data.data
  },

  /**
   * Close specific room
   */
  async closeRoom(roomId) {
    const response = await fetch(`/api/v1/breakout/room/${roomId}/close`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to close room')
    }
    return data.data
  }
}

window.breakoutAPI = breakoutAPI
