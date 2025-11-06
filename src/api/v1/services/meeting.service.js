// Meeting Service - Business Logic
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../../utils/error.util')

class MeetingService {
  generateCode() {
    return Math.random().toString(36).substring(2, 10)
  }

  async createMeeting(userId, meetingData) {
    const { title, capacity = 250 } = meetingData
    const code = this.generateCode()

    const meeting = await MeetingRoom.create({
      title,
      code,
      host: userId,
      capacity,
      participants: [userId],
      isActive: true
    })

    return meeting
  }

  async getMeetingByCode(code) {
    const meeting = await MeetingRoom.findOne({ code, isActive: true })
    if (!meeting) {
      throw new NotFoundError('Meeting not found or has ended')
    }
    return meeting
  }

  async getUserMeetings(userId) {
    const meetings = await MeetingRoom.find({
      participants: userId,
      isActive: true
    }).sort({ createdAt: -1 })

    return meetings
  }

  async joinMeeting(userId, code) {
    const meeting = await this.getMeetingByCode(code)

    // Check capacity
    if (meeting.participants.length >= meeting.capacity) {
      throw new BadRequestError(`Meeting is full (${meeting.capacity} participants)`)
    }

    // Add user to participants if not already in
    if (!meeting.participants.includes(userId)) {
      meeting.participants.push(userId)
      await meeting.save()
    }

    return meeting
  }

  async endMeeting(userId, code) {
    const meeting = await this.getMeetingByCode(code)

    // Only creator can end meeting (first participant)
    if (meeting.participants[0].toString() !== userId.toString()) {
      throw new ForbiddenError('Only meeting creator can end this meeting')
    }

    meeting.isActive = false
    await meeting.save()

    return meeting
  }

  async leaveMeeting(userId, code) {
    const meeting = await this.getMeetingByCode(code)

    // Remove user from participants
    meeting.participants = meeting.participants.filter(
      id => id.toString() !== userId.toString()
    )

    // End meeting if no participants left
    if (meeting.participants.length === 0) {
      meeting.isActive = false
    }

    await meeting.save()
    return meeting
  }
}

module.exports = new MeetingService()
