const FileShare = require('../../../models/FileShare')
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Cập nhật tệp được chia sẻ trong cuộc họp
 */
async function uploadFile({ meetingId, userId, fileData }) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Cuộc họp không tồn tại')
  }
  
  // Kiểm tra nếu người dùng là người tham gia
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Bạn không phải là người tham gia của cuộc họp này')
  }
  
  const fileShare = await FileShare.create({
    meeting: meetingId,
    uploader: userId,
    ...fileData
  })
  
  return await fileShare.populate('uploader', 'displayName email')
}

/**
 * Lấy các tệp trong cuộc họp
 */
async function getMeetingFiles(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Kiểm tra nếu người dùng là người tham gia
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Bạn không phải là người tham gia của cuộc họp này')
  }
  
  const files = await FileShare.find({ meeting: meetingId, isDeleted: false })
    .populate('uploader', 'displayName email')
    .sort({ uploadedAt: -1 })
  
  return files
}

/**
 * Tải xuống tệp (tăng bộ đếm)
 */
async function downloadFile(fileId, userId) {
  const file = await FileShare.findById(fileId).populate('meeting')
  if (!file) {
    throw new NotFoundError('Tệp không tồn tại')
  }
  
  if (file.isDeleted) {
    throw new ValidationError('Tệp đã bị xóa')
  }
  
  // Kiểm tra nếu người dùng có quyền truy cập
  const meeting = file.meeting
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Bạn không có quyền truy cập tệp này')
  }
  
  file.downloadCount += 1
  await file.save()
  
  return file
}

/**
 * Xóa tệp
 */
async function deleteFile(fileId, userId) {
  const file = await FileShare.findById(fileId).populate('meeting')
  if (!file) {
    throw new NotFoundError('Tệp không tồn tại')
  }
  
  // Kiểm tra nếu người dùng là người tải lên hoặc chủ trì cuộc họp
  const meeting = file.meeting
  if (file.uploader.toString() !== userId.toString() && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Chỉ người tải lên hoặc chủ trì cuộc họp mới có thể xóa tệp này')
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
