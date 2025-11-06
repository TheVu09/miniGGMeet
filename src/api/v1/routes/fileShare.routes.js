const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const { meetingIdValidation, fileIdValidation } = require('../validators/fileShare.validator')
const {
  uploadFile,
  getMeetingFiles,
  downloadFile,
  deleteFile,
  getUserFiles
} = require('../controllers/files/fileShare.controller')

// Note: multer middleware should be added here for file uploads
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })

// POST /api/v1/files/meeting/:meetingId/upload - Upload file
// router.post('/meeting/:meetingId/upload', requireAuth, meetingIdValidation, validate, upload.single('file'), uploadFile)
router.post('/meeting/:meetingId/upload', requireAuth, meetingIdValidation, validate, uploadFile)

// GET /api/v1/files/meeting/:meetingId - Get meeting files
router.get('/meeting/:meetingId', requireAuth, meetingIdValidation, validate, getMeetingFiles)

// GET /api/v1/files/:fileId/download - Download file (increment counter)
router.get('/:fileId/download', requireAuth, fileIdValidation, validate, downloadFile)

// DELETE /api/v1/files/:fileId - Delete file
router.delete('/:fileId', requireAuth, fileIdValidation, validate, deleteFile)

// GET /api/v1/files/my-files - Get user's uploaded files
router.get('/my-files', requireAuth, getUserFiles)

module.exports = router
