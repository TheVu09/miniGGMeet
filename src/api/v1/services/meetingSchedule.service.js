const MeetingSchedule = require('../../../models/MeetingSchedule')
const User = require('../../../models/User')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Tạo lịch họp
 */
async function createSchedule(userId, scheduleData) {
  try {
    console.log('Đang tạo lịch với dữ liệu:', { userId, ...scheduleData })
    
    // Trích xuất và làm sạch dữ liệu
    const {
      title,
      description = '',
      scheduledStartTime,
      scheduledEndTime,
      duration,
      timezone = 'Asia/Ho_Chi_Minh',
      participants = [],
      recurrence = { enabled: false, pattern: 'none' }
    } = scheduleData
    
    // Validate times
    const start = new Date(scheduledStartTime)
    const end = new Date(scheduledEndTime)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Định dạng ngày không hợp lệ')
    }
    
    if (start >= end) {
      throw new ValidationError('Thời gian kết thúc phải sau thời gian bắt đầu')
    }
    
    if (start < new Date()) {
      throw new ValidationError('Không thể lên lịch họp trong quá khứ')
    }
    
    // Validate duration
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = Math.round(durationMs / 60000)
    if (durationMinutes !== parseInt(duration)) {
      throw new ValidationError('Thời lượng không khớp với thời gian bắt đầu và kết thúc')
    }
    
    // Chuẩn bị dữ liệu lịch họp
    const schedulePayload = {
      title,
      description,
      scheduledStartTime: start,
      scheduledEndTime: end,
      duration: parseInt(duration),
      timezone,
      organizer: userId,
      status: 'scheduled',
      recurrence,
      participants: participants.map(p => ({
        user: p.userId || null,
        email: p.email || null,
        status: 'invited'
      }))
    }
    
    console.log('Đang tạo lịch với payload:', schedulePayload)
    
    // Tạo lịch
    const schedule = await MeetingSchedule.create(schedulePayload)
    console.log('Lịch đã được tạo:', schedule._id)
    
    const populatedSchedule = await schedule.populate([
      { path: 'organizer', select: 'displayName email' },
      { path: 'participants.user', select: 'displayName email' }
    ])
    
    return populatedSchedule
  } catch (error) {
    console.error('Error creating schedule:', {
      error: error.message,
      stack: error.stack,
      details: error
    })
    
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ')
      throw new ValidationError(errorMessage)
    }
    
    if (error.code === 11000) {
      throw new ValidationError('Lịch họp với tiêu đề này đã tồn tại')
    }
    
    throw error
  }
  
  return await schedule.populate([
    { path: 'organizer', select: 'displayName email' },
    { path: 'participants.user', select: 'displayName email' }
  ])
}

/**
 * Lấy lịch họp của người dùng
 */
async function getUserSchedules(userId, { status, startDate, endDate } = {}) {
  const query = {
    $or: [
      { organizer: userId },
      { 'participants.user': userId }
    ]
  }
  
  if (status) {
    query.status = status
  }
  
  if (startDate || endDate) {
    query.scheduledStartTime = {}
    if (startDate) query.scheduledStartTime.$gte = new Date(startDate)
    if (endDate) query.scheduledStartTime.$lte = new Date(endDate)
  }
  
  const schedules = await MeetingSchedule.find(query)
    .populate('organizer', 'displayName email')
    .populate('participants.user', 'displayName email')
    .sort({ scheduledStartTime: 1 })
  
  return schedules
}

/**
 * Lấy lịch họp theo ID
 */
async function getScheduleById(scheduleId, userId) {
  const schedule = await MeetingSchedule.findById(scheduleId)
    .populate('organizer', 'displayName email')
    .populate('participants.user', 'displayName email')
    .populate('meetingRoom')
  
  if (!schedule) {
    throw new NotFoundError('Lịch họp không tồn tại')
  }
  
  // Kiểm tra nếu người dùng có quyền truy cập
  const isOrganizer = schedule.organizer._id.toString() === userId.toString()
  const isParticipant = schedule.participants.some(p => p.user && p.user._id.toString() === userId.toString())
  
  if (!isOrganizer && !isParticipant) {
    throw new ForbiddenError('Bạn không có quyền truy cập lịch họp này')
  }
  
  return schedule
}

/**
 * Cập nhật lịch họp
 */
async function updateSchedule(scheduleId, userId, updateData) {
  const schedule = await MeetingSchedule.findById(scheduleId)
  if (!schedule) {
    throw new NotFoundError('Lịch họp không tồn tại')
  }
  
  if (schedule.organizer.toString() !== userId.toString()) {
    throw new ForbiddenError('Chỉ người tổ chức mới có thể cập nhật lịch họp')
  }
  
  if (schedule.status === 'cancelled') {
    throw new ValidationError('Không thể cập nhật lịch họp đã bị hủy')
  }
  
  Object.assign(schedule, updateData)
  await schedule.save()
  
  return await schedule.populate([
    { path: 'organizer', select: 'displayName email' },
    { path: 'participants.user', select: 'displayName email' }
  ])
}

/**
 * Hủy lịch họp
 */
async function cancelSchedule(scheduleId, userId, cancellationReason) {
  const schedule = await MeetingSchedule.findById(scheduleId)
  if (!schedule) {
    throw new NotFoundError('Lịch họp không tồn tại')
  }
  
  if (schedule.organizer.toString() !== userId.toString()) {
    throw new ForbiddenError('Chỉ người tổ chức mới có thể hủy lịch họp')
  }
  
  schedule.status = 'cancelled'
  schedule.cancelledAt = new Date()
  schedule.cancellationReason = cancellationReason
  await schedule.save()
  
  return schedule
}

/**
 * Phản hồi lời mời (chấp nhận/từ chối/tạm thời)
 */
async function respondToInvitation(scheduleId, userId, response) {
  const schedule = await MeetingSchedule.findById(scheduleId)
  if (!schedule) {
    throw new NotFoundError('Lịch họp không tồn tại')
  }
  
  const participant = schedule.participants.find(p => p.user && p.user.toString() === userId.toString())
  if (!participant) {
    throw new NotFoundError('Bạn không được mời tham gia cuộc họp này')
  }
  
  participant.status = response
  participant.respondedAt = new Date()
  await schedule.save()
  
  return await schedule.populate([
    { path: 'organizer', select: 'displayName email' },
    { path: 'participants.user', select: 'displayName email' }
  ])
}

/**
 * Lấy lịch họp sắp tới (7 ngày tiếp theo)
 */
async function getUpcomingSchedules(userId) {
  const now = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const schedules = await MeetingSchedule.find({
    $or: [
      { organizer: userId },
      { 'participants.user': userId }
    ],
    status: { $in: ['scheduled', 'in-progress'] },
    scheduledStartTime: { $gte: now, $lte: nextWeek }
  })
    .populate('organizer', 'displayName email')
    .sort({ scheduledStartTime: 1 })
    .limit(10)
  
  return schedules
}

module.exports = {
  createSchedule,
  getUserSchedules,
  getScheduleById,
  updateSchedule,
  cancelSchedule,
  respondToInvitation,
  getUpcomingSchedules
}
