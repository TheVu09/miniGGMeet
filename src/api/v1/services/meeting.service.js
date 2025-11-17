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

    console.log('Creating meeting:', { userId, title, code, capacity })

    const meeting = await MeetingRoom.create({
      title,
      code,
      host: userId,
      capacity,
      participants: [userId],
      isActive: true
    })

    console.log('Meeting created successfully:', {
      id: meeting._id,
      code: meeting.code,
      title: meeting.title,
      saved: meeting.isNew === false
    })

    // Verify meeting was saved by querying it back
    const verification = await MeetingRoom.findOne({ code })
    if (verification) {
      console.log('Verified meeting exists in database:', {
        id: verification._id,
        code: verification.code,
        collection: MeetingRoom.collection.name
      })
    } else {
      console.error('WARNING: Meeting not found in database after creation!')
    }

    return meeting
  }

  async getMeetingByCode(code) {
    const meeting = await MeetingRoom.findOne({ code, isActive: true })
    if (!meeting) {
      throw new NotFoundError('Cuộc họp không tồn tại hoặc đã kết thúc')
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

    // Kiểm tra sức chứa
    if (meeting.participants.length >= meeting.capacity) {
      throw new BadRequestError(`Cuộc họp đã đầy (${meeting.capacity} người tham gia)`)
    }

    // Thêm người dùng vào danh sách người tham gia nếu chưa có
    if (!meeting.participants.includes(userId)) {
      meeting.participants.push(userId)
      await meeting.save()
    }

    return meeting
  }

  async endMeeting(userId, code) {
    const meeting = await this.getMeetingByCode(code)

    // Chỉ người tạo cuộc họp (người tham gia đầu tiên) mới có thể kết thúc
    if (meeting.participants[0].toString() !== userId.toString()) {
      throw new ForbiddenError('Chỉ người tạo cuộc họp mới có thể kết thúc cuộc họp này')
    }

    meeting.isActive = false
    await meeting.save()

    return meeting
  }

  async leaveMeeting(userId, code) {
    const meeting = await this.getMeetingByCode(code)

    // Xóa người dùng khỏi danh sách người tham gia
    meeting.participants = meeting.participants.filter(
      id => id.toString() !== userId.toString()
    )

    // Kết thúc cuộc họp nếu không còn người tham gia
    if (meeting.participants.length === 0) {
      meeting.isActive = false
    }

    await meeting.save()
    return meeting
  }
}

module.exports = new MeetingService()
