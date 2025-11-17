// User API Client
class UserAPI {
  constructor() {
    this.baseURL = '/api/v1/users'
  }

  /**
   * Get current user profile with friends
   * @returns {Promise<{user}>}
   */
  async getProfile() {
    const response = await fetch(`${this.baseURL}/me`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get profile')
    }

    return data.data
  }

  /**
   * Get friends list
   * @returns {Promise<{friends: Array, count: number}>}
   */
  async getFriends() {
    const response = await fetch(`${this.baseURL}/friends`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get friends')
    }

    return data.data
  }

  /**
   * Get friend requests
   * @returns {Promise<{requests: Array, count: number}>}
   */
  async getFriendRequests() {
    const response = await fetch(`${this.baseURL}/friend-requests`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get friend requests')
    }

    return data.data
  }

  /**
   * Send friend request
   * @param {string} email - Target user email
   * @returns {Promise<void>}
   */
  
  async sendFriendRequest(email) {
    const response = await fetch(`${this.baseURL}/friend-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send friend request')
    }

    return data
  }

  /**
   * Accept friend request
   * @param {string} requesterId 
   * @returns {Promise<void>}
   */

  async acceptFriendRequest(requesterId) {
    const response = await fetch(`${this.baseURL}/friend-requests/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requesterId })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to accept friend request')
    }

    return data
  }

  /**
   * Reject friend request
   * @param {string} requesterId 
   * @returns {Promise<void>}
   */
  async rejectFriendRequest(requesterId) {
    const response = await fetch(`${this.baseURL}/friend-requests/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requesterId })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to reject friend request')
    }

    return data
  }

  /**
   * Remove friend
   * @param {string} friendId 
   * @returns {Promise<void>}
   */
  async removeFriend(friendId) {
    const response = await fetch(`${this.baseURL}/friends/${friendId}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to remove friend')
    }

    return data
  }
}

// Export singleton instance
const userAPI = new UserAPI()
