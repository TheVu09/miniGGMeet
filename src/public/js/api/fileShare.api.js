// File Share API Client
const fileShareAPI = {
  /**
   * Upload file to meeting
   */
  async uploadFile(meetingId, file, description = '') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', description)
    
    const response = await fetch(`/api/v1/files/meeting/${meetingId}/upload`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Upload failed')
    }
    return data.data
  },

  /**
   * Get meeting files
   */
  async getMeetingFiles(meetingId) {
    const response = await fetch(`/api/v1/files/meeting/${meetingId}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch files')
    }
    return data.data
  },

  /**
   * Download file
   */
  async downloadFile(fileId) {
    const response = await fetch(`/api/v1/files/${fileId}/download`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Download failed')
    }
    return data.data
  },

  /**
   * Delete file
   */
  async deleteFile(fileId) {
    const response = await fetch(`/api/v1/files/${fileId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Delete failed')
    }
    return true
  },

  /**
   * Get user's uploaded files
   */
  async getMyFiles(limit = 50, skip = 0) {
    const response = await fetch(`/api/v1/files/my-files?limit=${limit}&skip=${skip}`)
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch files')
    }
    return data.data
  }
}

// Make available globally
window.fileShareAPI = fileShareAPI
