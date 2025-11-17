const FileShare = require('../../../models/FileShare')
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Upload file to meeting
 */
async function uploadFile({ meetingId, userId, fileData }) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Check if user is participant
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not a participant of this meeting')
  }
  
  const fileShare = await FileShare.create({
    meeting: meetingId,
    uploader: userId,
    ...fileData
  })
  
  return await fileShare.populate('uploader', 'displayName email')
}

/**
 * Get meeting files
 */
async function getMeetingFiles(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Check if user is participant
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not a participant of this meeting')
  }
  
  const files = await FileShare.find({ meeting: meetingId, isDeleted: false })
    .populate('uploader', 'displayName email')
    .sort({ uploadedAt: -1 })
  
  return files
}

/**
 * Download file (increment counter)
 */
async function downloadFile(fileId, userId) {
  const file = await FileShare.findById(fileId).populate('meeting')
  if (!file) {
    throw new NotFoundError('File not found')
  }
  
  if (file.isDeleted) {
    throw new ValidationError('File has been deleted')
  }
  
  // Check if user has access
  const meeting = file.meeting
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('You do not have access to this file')
  }
  
  file.downloadCount += 1
  await file.save()
  
  return file
}

/**
 * Delete file
 */
async function deleteFile(fileId, userId) {
  const file = await FileShare.findById(fileId).populate('meeting')
  if (!file) {
    throw new NotFoundError('File not found')
  }
  
  // Check if user is uploader or host
  const meeting = file.meeting
  if (file.uploader.toString() !== userId.toString() && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the uploader or meeting host can delete this file')
  }
  
  file.isDeleted = true
  file.deletedAt = new Date()
  await file.save()
  
  return file
}

/**
 * Get user's uploaded files
 */
async function getUserFiles(userId, { limit = 50, skip = 0 } = {}) {
  const files = await FileShare.find({ uploader: userId, isDeleted: false })
    .populate('meeting', 'title code')
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .skip(skip)
  
  const total = await FileShare.countDocuments({ uploader: userId, isDeleted: false })
  
  return {
    files,
    total,
    hasMore: total > skip + files.length
  }
}

module.exports = {
  uploadFile,
  getMeetingFiles,
  downloadFile,
  deleteFile,
  getUserFiles
}
