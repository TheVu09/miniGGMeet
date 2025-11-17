const BreakoutRoom = require('../../../models/BreakoutRoom')
const MeetingRoom = require('../../../models/MeetingRoom')
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../utils/error.util')

/**
 * Tạo mã phòng duy nhất
 */
async function generateUniqueRoomCode() {
  let code
  let exists = true
  let attempts = 0
  const maxAttempts = 10
  
  while (exists && attempts < maxAttempts) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Kiểm tra xem mã đã tồn tại chưa
    const existing = await BreakoutRoom.findOne({ roomCode: code })
    exists = !!existing
    attempts++
  }
  
  if (exists) {
    throw new Error('Failed to generate unique room code')
  }
  
  return code
}

/**
 * Tạo các phòng breakout
 */
async function createBreakoutRooms(meetingId, userId, { numberOfRooms, roomNames, assignmentType, capacity }) {
  try {
    console.log('Creating breakout rooms:', { meetingId, userId, numberOfRooms, assignmentType, capacity })
    
    const meeting = await MeetingRoom.findById(meetingId).populate('participants')
    if (!meeting) {
      throw new NotFoundError('Meeting not found')
    }
    
    console.log('Meeting found:', meeting._id, 'Host:', meeting.host)
    
    // Chỉ host mới có thể tạo phòng breakout
    if (meeting.host.toString() !== userId.toString()) {
      throw new ForbiddenError('Only the host can create breakout rooms')
    }
    
    if (numberOfRooms < 2 || numberOfRooms > 50) {
      throw new ValidationError('Number of rooms must be between 2 and 50')
    }
    
    // Kiểm tra xem phòng breakout đã tồn tại chưa
    const existing = await BreakoutRoom.find({ parentMeeting: meetingId, status: { $in: ['created', 'active'] } })
    if (existing.length > 0) {
      throw new ValidationError('Breakout rooms already exist for this meeting. Close them first.')
    }
    
    const rooms = []
    
    for (let i = 1; i <= numberOfRooms; i++) {
      const roomName = roomNames && roomNames[i - 1] ? roomNames[i - 1] : `Room ${i}`
      
      // Tạo mã phòng duy nhất
      const roomCode = await generateUniqueRoomCode()
      
      console.log(`Creating room ${i}:`, { roomName, roomCode })
      
      const room = await BreakoutRoom.create({
        parentMeeting: meetingId,
        roomNumber: i,
        roomName,
        roomCode,
        capacity: capacity || 10,
        createdBy: userId
      })
      
      console.log(`Room ${i} created:`, room._id)
      rooms.push(room)
    }
    
    // Tự động phân phối người tham gia nếu kiểu phân phối là 'random'
    if (assignmentType === 'random') {
      await assignParticipantsRandomly(meetingId, rooms)
    }
    
    console.log(`Successfully created ${rooms.length} breakout rooms`)
    
    // Phát sự kiện socket để thông báo cho tất cả người tham gia
    // Lưu ý: Socket.IO instance cần được truyền vào hoặc truy cập toàn cục
    // Hiện tại, chúng ta sẽ trả về rooms và phát từ controller
    
    return rooms
  } catch (error) {
    console.error('Error in createBreakoutRooms:', error)
    throw error
  }
}

/**
 * Phân phối người tham gia ngẫu nhiên vào các phòng breakout
 */
async function assignParticipantsRandomly(meetingId, rooms) {
  const meeting = await MeetingRoom.findById(meetingId)
  const participants = meeting.participants.filter(p => p.toString() !== meeting.host.toString())
  
  // Xáo trộn danh sách người tham gia
  const shuffled = participants.sort(() => 0.5 - Math.random())
  
  // Phân phối người tham gia vào các phòng
  for (let i = 0; i < shuffled.length; i++) {
    const roomIndex = i % rooms.length
    const room = rooms[roomIndex]
    
    room.assignedParticipants.push({
      user: shuffled[i],
      assignmentType: 'random',
      isPresent: false
    })
    
    await room.save()
  }
}

/**
 * Phân phối người tham gia vào phòng cụ thể (thủ công)
 */
async function assignParticipant(roomId, userId, participantId) {
  const room = await BreakoutRoom.findById(roomId).populate('parentMeeting')
  if (!room) {
    throw new NotFoundError('Breakout room not found')
  }
  
  const meeting = room.parentMeeting
  
  // Chỉ host mới có thể phân phối thủ công
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the host can assign participants')
  }
  
  // Kiểm tra xem người tham gia có trong phòng họp chính không
  if (!meeting.participants.includes(participantId)) {
    throw new ValidationError('Participant is not in the main meeting')
  }
  
  // Kiểm tra xem đã được phân phối chưa
  const alreadyAssigned = room.assignedParticipants.some(p => p.user.toString() === participantId.toString())
  if (alreadyAssigned) {
    throw new ValidationError('Participant already assigned to this room')
  }
  
  // Kiểm tra sức chứa
  if (room.assignedParticipants.length >= room.capacity) {
    throw new ValidationError('Room is at full capacity')
  }
  
  room.assignedParticipants.push({
    user: participantId,
    assignmentType: 'manual',
    isPresent: false
  })
  
  await room.save()
  return await room.populate('assignedParticipants.user', 'displayName email')
}

/**
 * Tham gia phòng breakout
 */
async function joinBreakoutRoom(roomId, userId) {
  const room = await BreakoutRoom.findById(roomId).populate('parentMeeting')
  if (!room) {
    throw new NotFoundError('Breakout room not found')
  }
  
  if (room.status !== 'active' && room.status !== 'created') {
    throw new ValidationError('Breakout room is not available')
  }
  
  // Kiểm tra xem người dùng có phải là người tham gia phòng họp chính không
  const parentMeeting = room.parentMeeting
  if (!parentMeeting.participants.includes(userId)) {
    throw new ForbiddenError('You must be a participant of the main meeting')
  }
  
  const participant = room.assignedParticipants.find(p => p.user.toString() === userId.toString())
  if (!participant) {
    // Kiểm tra sức chứa
    if (room.assignedParticipants.length >= room.capacity) {
      throw new ValidationError('Room is at full capacity')
    }
    
    // Cho phép bất kỳ ai tham gia (tự chọn)
    room.assignedParticipants.push({
      user: userId,
      assignmentType: 'self-select',
      joinedAt: new Date(),
      isPresent: true
    })
  } else {
    participant.joinedAt = new Date()
    participant.isPresent = true
  }
  
  await room.updateParticipantCount()
  
  return await room.populate('assignedParticipants.user', 'displayName email')
}

/**
 * Rời khỏi phòng breakout
 */
async function leaveBreakoutRoom(roomId, userId) {
  const room = await BreakoutRoom.findById(roomId)
  if (!room) {
    throw new NotFoundError('Breakout room not found')
  }
  
  const participant = room.assignedParticipants.find(p => p.user.toString() === userId.toString())
  if (!participant) {
    throw new NotFoundError('You are not in this room')
  }
  
  participant.leftAt = new Date()
  participant.isPresent = false
  
  await room.updateParticipantCount()
  
  return room
}

/**
 * Lấy danh sách phòng breakout của cuộc họp
 */
async function getMeetingBreakoutRooms(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  // Kiểm tra xem người dùng có phải là người tham gia không
  if (!meeting.participants.includes(userId) && meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not a participant of this meeting')
  }
  
  const rooms = await BreakoutRoom.find({ 
    parentMeeting: meetingId,
    status: { $in: ['created', 'active'] }
  })
    .populate('assignedParticipants.user', 'displayName email')
    .populate('moderator', 'displayName email')
    .sort({ roomNumber: 1 })
  
  return rooms
}

/**
 * Bắt đầu các phòng breakout (mở tất cả)
 */
async function startBreakoutRooms(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the host can start breakout rooms')
  }
  
  const result = await BreakoutRoom.updateMany(
    { parentMeeting: meetingId, status: 'created' },
    { status: 'active', startedAt: new Date() }
  )
  
  return { message: 'Breakout rooms started', modifiedCount: result.modifiedCount }
}

/**
 * Đóng phòng breakout
 */
async function closeBreakoutRoom(roomId, userId) {
  const room = await BreakoutRoom.findById(roomId).populate('parentMeeting')
  if (!room) {
    throw new NotFoundError('Breakout room not found')
  }
  
  const meeting = room.parentMeeting
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the host can close breakout rooms')
  }
  
  room.status = 'closed'
  room.closedAt = new Date()
  
  if (room.startedAt) {
    room.duration = Math.floor((Date.now() - room.startedAt.getTime()) / 1000)
  }
  
  await room.save()
  return room
}

/**
 * Đóng tất cả phòng breakout và gộp lại
 */
async function closeAllBreakoutRooms(meetingId, userId) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the host can close breakout rooms')
  }
  
  const rooms = await BreakoutRoom.find({ 
    parentMeeting: meetingId,
    status: 'active'
  })
  
  for (const room of rooms) {
    room.status = 'merged'
    room.closedAt = new Date()
    room.mergedBackAt = new Date()
    
    if (room.startedAt) {
      room.duration = Math.floor((Date.now() - room.startedAt.getTime()) / 1000)
    }
    
    await room.save()
  }
  
  return { message: 'All breakout rooms closed', closedCount: rooms.length }
}

/**
 * Phát thông báo đến tất cả phòng breakout
 */
async function broadcastToBreakoutRooms(meetingId, userId, message) {
  const meeting = await MeetingRoom.findById(meetingId)
  if (!meeting) {
    throw new NotFoundError('Meeting not found')
  }
  
  if (meeting.host.toString() !== userId.toString()) {
    throw new ForbiddenError('Only the host can broadcast messages')
  }
  
  const rooms = await BreakoutRoom.find({ 
    parentMeeting: meetingId,
    status: 'active'
  })
  
  const broadcastMessage = {
    user: userId,
    message: `[BROADCAST] ${message}`,
    timestamp: new Date()
  }
  
  for (const room of rooms) {
    room.chatHistory.push(broadcastMessage)
    await room.save()
  }
  
  return { message: 'Message broadcasted', roomCount: rooms.length }
}

module.exports = {
  createBreakoutRooms,
  assignParticipant,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  getMeetingBreakoutRooms,
  startBreakoutRooms,
  closeBreakoutRoom,
  closeAllBreakoutRooms,
  broadcastToBreakoutRooms
}
