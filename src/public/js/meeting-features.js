// Meeting Features - File Share, Roles, Device Status
// This file extends meeting.js with new features

(function() {
  const meetingId = window.__MEETING__.roomId
  const userId = window.__MEETING__.user.id

  // ==================== FILE SHARE ====================
  
  // Load files
  async function loadFiles() {
    try {
      const files = await fileShareAPI.getMeetingFiles(meetingId)
      renderFiles(files)
    } catch (err) {
      document.getElementById('filesList').innerHTML = 
        '<p class="text-danger small">Lỗi tải file</p>'
    }
  }

  // Render files
  function renderFiles(files) {
    const container = document.getElementById('filesList')
    if (files.length === 0) {
      container.innerHTML = '<p class="text-muted text-center small">Chưa có file nào</p>'
      return
    }

    container.innerHTML = files.map(file => `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <div class="flex-grow-1">
          <div class="fw-bold small">${file.fileName}</div>
          <div class="text-muted" style="font-size: 0.75rem;">
            ${formatFileSize(file.fileSize)} • ${new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
            ${file.description ? `<br><em>${file.description}</em>` : ''}
          </div>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" onclick="downloadFile('${file._id}')">
            <i class="bi bi-download"></i>
          </button>
          ${file.uploadedBy === userId ? `
            <button class="btn btn-sm btn-outline-danger" onclick="deleteFile('${file._id}')">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('')
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Upload file
  window.uploadFileBtn = document.getElementById('uploadFileBtn')
  if (uploadFileBtn) {
    uploadFileBtn.addEventListener('click', async () => {
      const fileInput = document.getElementById('fileUploadInput')
      const file = fileInput.files[0]
      if (!file) {
        alert('Vui lòng chọn file')
        return
      }

      uploadFileBtn.disabled = true
      uploadFileBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Đang tải...'

      try {
        await fileShareAPI.uploadFile(meetingId, file)
        alert('Tải file thành công!')
        fileInput.value = ''
        loadFiles()
      } catch (err) {
        alert('Lỗi: ' + err.message)
      } finally {
        uploadFileBtn.disabled = false
        uploadFileBtn.innerHTML = '<i class="bi bi-upload"></i> Tải lên'
      }
    })
  }

  // Download file
  window.downloadFile = async function(fileId) {
    try {
      const data = await fileShareAPI.downloadFile(fileId)
      window.open(data.fileUrl, '_blank')
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  // Delete file
  window.deleteFile = async function(fileId) {
    if (!confirm('Xóa file này?')) return
    try {
      await fileShareAPI.deleteFile(fileId)
      alert('Đã xóa file!')
      loadFiles()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  // ==================== ROLES & PERMISSIONS ====================
  
  // Load my role
  async function loadMyRole() {
    try {
      const role = await roleAPI.getMyRole(meetingId)
      document.getElementById('myRole').textContent = translateRole(role.role)
      document.getElementById('myRole').className = `badge bg-${getRoleBadgeColor(role.role)}`
    } catch (err) {
      document.getElementById('myRole').textContent = 'Lỗi'
      document.getElementById('myRole').className = 'badge bg-secondary'
    }
  }

  // Load all roles
  async function loadRoles() {
    try {
      const roles = await roleAPI.getMeetingRoles(meetingId)
      renderRoles(roles)
    } catch (err) {
      document.getElementById('participantRoles').innerHTML = 
        '<p class="text-danger small">Lỗi tải danh sách</p>'
    }
  }

  // Render roles
  function renderRoles(roles) {
    const container = document.getElementById('participantRoles')
    if (roles.length === 0) {
      container.innerHTML = '<p class="text-muted text-center small">Chưa có người nào</p>'
      return
    }

    container.innerHTML = roles.map(r => `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <div>
          <div class="fw-bold small">${r.userId.displayName || r.userId.email || 'User'}</div>
          <span class="badge bg-${getRoleBadgeColor(r.role)}">${translateRole(r.role)}</span>
        </div>
        <button class="btn btn-sm btn-outline-warning" onclick="changeRole('${r.userId._id}', '${r.role}')">
          <i class="bi bi-pencil"></i> Đổi
        </button>
      </div>
    `).join('')
  }

  // Translate role
  function translateRole(role) {
    const map = {
      host: 'Chủ trì',
      'co-host': 'Đồng chủ trì',
      moderator: 'Điều hành',
      presenter: 'Trình bày',
      participant: 'Thành viên'
    }
    return map[role] || role
  }

  // Get role badge color
  function getRoleBadgeColor(role) {
    const map = {
      host: 'danger',
      'co-host': 'warning',
      moderator: 'info',
      presenter: 'success',
      participant: 'secondary'
    }
    return map[role] || 'secondary'
  }

  // Change role
  window.changeRole = async function(targetUserId, currentRole) {
    const newRole = prompt('Vai trò mới (host, co-host, moderator, presenter, participant):', currentRole)
    if (!newRole) return
    const validRoles = ['host', 'co-host', 'moderator', 'presenter', 'participant']
    if (!validRoles.includes(newRole)) {
      alert('Vai trò không hợp lệ')
      return
    }

    try {
      await roleAPI.assignRole(meetingId, targetUserId, newRole)
      alert('Đã cập nhật vai trò!')
      loadRoles()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  // ==================== DEVICE STATUS INTEGRATION ====================
  
  // Sync device status with API when buttons are clicked
  const originalMicBtn = document.getElementById('micBtn')
  const originalCamBtn = document.getElementById('camBtn')
  const originalScreenBtn = document.getElementById('screenBtn')
  const originalRaiseBtn = document.getElementById('raiseBtn')

  if (originalMicBtn) {
    originalMicBtn.addEventListener('click', async () => {
      try {
        await deviceStatusAPI.toggleMute(meetingId)
      } catch (err) {
        console.error('Failed to sync mic status:', err)
      }
    })
  }

  if (originalCamBtn) {
    originalCamBtn.addEventListener('click', async () => {
      try {
        await deviceStatusAPI.toggleVideo(meetingId)
      } catch (err) {
        console.error('Failed to sync camera status:', err)
      }
    })
  }

  if (originalScreenBtn) {
    originalScreenBtn.addEventListener('click', async () => {
      try {
        await deviceStatusAPI.toggleScreenShare(meetingId)
      } catch (err) {
        console.error('Failed to sync screen share status:', err)
      }
    })
  }

  if (originalRaiseBtn) {
    originalRaiseBtn.addEventListener('click', async () => {
      try {
        await deviceStatusAPI.toggleHandRaise(meetingId)
      } catch (err) {
        console.error('Failed to sync hand raise status:', err)
      }
    })
  }

  // ==================== INITIALIZE ====================
  
  // Load data when modals open
  const filesModal = document.getElementById('filesModal')
  if (filesModal) {
    filesModal.addEventListener('show.bs.modal', loadFiles)
  }

  const rolesModal = document.getElementById('rolesModal')
  if (rolesModal) {
    rolesModal.addEventListener('show.bs.modal', () => {
      loadMyRole()
      loadRoles()
    })
  }

  console.log('Meeting features initialized')
})()
