// Auth API Client
class AuthAPI {
  constructor() {
    this.baseURL = '/api/v1/auth'
  }

  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{user}>}
   */
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      // Extract error message with details if available
      let errorMessage = data.error?.message || 'Login failed'
      if (data.error?.details && data.error.details.length > 0) {
        const detailMessages = data.error.details.map(d => d.message).join(', ')
        errorMessage = detailMessages
      }
      throw new Error(errorMessage)
    }

    return data.data
  }

  /**
   * Register new user
   * @param {string} email 
   * @param {string} displayName 
   * @param {string} password 
   * @param {string} confirmPassword 
   * @returns {Promise<{user}>}
   */
  async register(email, displayName, password, confirmPassword) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, displayName, password, confirmPassword })
    })

    const data = await response.json()

    if (!response.ok) {
      // Extract error message with details if available
      let errorMessage = data.error?.message || 'Registration failed'
      if (data.error?.details && data.error.details.length > 0) {
        const detailMessages = data.error.details.map(d => d.message).join(', ')
        errorMessage = detailMessages
      }
      throw new Error(errorMessage)
    }

    return data.data
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    const response = await fetch(`${this.baseURL}/logout`, {
      method: 'POST'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Logout failed')
    }

    return data
  }

  /**
   * Get current user info
   * @returns {Promise<{user}>}
   */
  async getMe() {
    const response = await fetch(`${this.baseURL}/me`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get user info')
    }
    return data.data
  }
}

const authAPI = new AuthAPI()
