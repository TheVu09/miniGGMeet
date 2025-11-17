const MeetingSchedule = require('../../../models/MeetingSchedule')
const User = require('../../../models/User')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Create scheduled meeting
 */
async function createSchedule(userId, scheduleData) {
  try {
    console.log('Creating schedule with data:', { userId, ...scheduleData })
    
    // Extract and clean data
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
      throw new ValidationError('Invalid date format')
    }
    
    if (start >= end) {
      throw new ValidationError('End time must be after start time')
    }
    
    if (start < new Date()) {
      throw new ValidationError('Cannot schedule meeting in the past')
    }
    
    // Validate duration
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = Math.round(durationMs / 60000)
    if (durationMinutes !== parseInt(duration)) {
      throw new ValidationError('Duration does not match start and end times')
    }
    
    // Prepare schedule data
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
    
    console.log('Creating schedule with payload:', schedulePayload)
    
    // Create schedule
    const schedule = await MeetingSchedule.create(schedulePayload)
    console.log('Schedule created:', schedule._id)
    
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
      throw new ValidationError('A schedule already exists at this time')
    }
    
    throw error
  }
  
  return await schedule.populate([
    { path: 'organizer', select: 'displayName email' },
    { path: 'participants.user', select: 'displayName email' }
  ])
}

/**
 * Get user schedules
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
 * Get schedule by ID
 */
async function getScheduleById(scheduleId, userId) {
  const schedule = await MeetingSchedule.findById(scheduleId)
    .populate('organizer', 'displayName email')
    .populate('participants.user', 'displayName email')
    .populate('meetingRoom')
  
  if (!schedule) {
    throw new NotFoundError('Schedule not found')
  }
  
  // Check if user has access
  const isOrganizer = schedule.organizer._id.toString() === userId.toString()
  const isParticipant = schedule.participants.some(p => p.user && p.user._id.toString() === userId.toString())
  
  if (!isOrganizer && !isParticipant) {
    throw new ForbiddenError('You do not have access to this schedule')
  }
  
  return schedule
}

/**
 * Update schedule
 */
async function updateSchedule(scheduleId, userId, updateData) {
  const schedule = await MeetingSchedule.findById(scheduleId)
  if (!schedule) {
    throw new NotFoundError('Schedule not found')
  }
  
  if (schedule.organizer.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the organizer can update the schedule')
  }
  
  if (schedule.status === 'cancelled') {
    throw new ValidationError('Cannot update cancelled schedule')
  }
  
  Object.assign(schedule, updateData)
  await schedule.save()
  
  return await schedule.populate([
    { path: 'organizer', select: 'displayName email' },
    { path: 'participants.user', select: 'displayName email' }
  ])
}

/**
 * Cancel schedule
 */
async function cancelSchedule(scheduleId, userId, cancellationReason) {
  const schedule = await MeetingSchedule.findById(scheduleId)
  if (!schedule) {
    throw new NotFoundError('Schedule not found')
  }
  
  if (schedule.organizer.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the organizer can cancel the schedule')
  }
  
  schedule.status = 'cancelled'
  schedule.cancelledAt = new Date()
  schedule.cancellationReason = cancellationReason
  await schedule.save()
  
  return schedule
}

/**
 * Respond to invitation (accept/decline/tentative)
 */
async function respondToInvitation(scheduleId, userId, response) {
  const schedule = await MeetingSchedule.findById(scheduleId)
  if (!schedule) {
    throw new NotFoundError('Schedule not found')
  }
  
  const participant = schedule.participants.find(p => p.user && p.user.toString() === userId.toString())
  if (!participant) {
    throw new NotFoundError('You are not invited to this meeting')
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
 * Get upcoming schedules (next 7 days)
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
