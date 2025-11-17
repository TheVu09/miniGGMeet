const fileShareService = require('../../services/fileShare.service')
const ApiResponse = require('../../../../utils/response.util')

// Note: File upload will be handled by multer middleware
// This assumes fileData comes from multer

async function uploadFile(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    // File data from multer
    const file = req.file
    if (!file) {
      return res.status(400).json(ApiResponse.error('No file uploaded', 400))
    }
    
    const fileData = {
      fileName: file.filename,
      originalName: file.originalname,
      fileType: getFileType(file.mimetype),
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      fileUrl: `/uploads/${file.filename}`,
      description: req.body.description || ''
    }
    
    const fileShare = await fileShareService.uploadFile({
      meetingId,
      userId,
      fileData
    })
    
    res.status(201).json(ApiResponse.success(fileShare, 'File uploaded successfully'))
  } catch (error) {
    next(error)
  }
}

async function getMeetingFiles(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const files = await fileShareService.getMeetingFiles(meetingId, userId)
    
    res.json(ApiResponse.success(files, 'Files retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

async function downloadFile(req, res, next) {
  try {
    const userId = req.session.user.id
    const { fileId } = req.params
    
    const file = await fileShareService.downloadFile(fileId, userId)
    
    res.json(ApiResponse.success(file, 'File ready for download'))
  } catch (error) {
    next(error)
  }
}

async function deleteFile(req, res, next) {
  try {
    const userId = req.session.user.id
    const { fileId } = req.params
    
    await fileShareService.deleteFile(fileId, userId)
    
    res.json(ApiResponse.success(null, 'File deleted successfully'))
  } catch (error) {
    next(error)
  }
}

async function getUserFiles(req, res, next) {
  try {
    const userId = req.session.user.id
    const { limit, skip } = req.query
    
    const result = await fileShareService.getUserFiles(userId, {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0
    })
    
    res.json(ApiResponse.success(result, 'User files retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

// Helper function to determine file type
function getFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
  return 'other'
}

module.exports = {
  uploadFile,
  getMeetingFiles,
  downloadFile,
  deleteFile,
  getUserFiles
}
