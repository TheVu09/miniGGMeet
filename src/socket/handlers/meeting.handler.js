// Meeting Socket Handler
const MeetingRoom = require('../../models/MeetingRoom')
const Message = require('../../models/Message')

/**
 * Handle meeting:join event
 */
async function handleJoinMeeting(io, socket, { code, userId, displayName }) {
  console.log(`${socket.id} (${displayName}) wants to join room ${code}`)
  
  try {
    // Check both regular meetings and breakout rooms
    let room = await MeetingRoom.findOne({ code, isActive: true })
    let isBreakoutRoom = false
    
    if (!room) {
      // If not a regular meeting room, check breakout rooms
      const breakoutRoom = await require('../../models/BreakoutRoom').findOne({ 
        roomCode: code,
        status: { $in: ['created', 'active'] }
      }).populate('parentMeeting')
      
      if (!breakoutRoom) {
        socket.emit('meeting:error', 'Phòng họp không tồn tại')
        return
      }
      
      // Check if user is in parent meeting participants
      const parentMeeting = breakoutRoom.parentMeeting
      if (!parentMeeting.participants.includes(userId)) {
        socket.emit('meeting:error', 'Bạn phải là thành viên của phòng họp chính để tham gia phòng breakout')
        return
      }
      
      room = {
        code: breakoutRoom.roomCode,
        capacity: breakoutRoom.capacity,
        isBreakoutRoom: true,
        parentMeeting: parentMeeting._id
      }
      isBreakoutRoom = true
    }
    
    const clients = io.sockets.adapter.rooms.get(code)
    const current = clients ? clients.size : 0
    
    if (current >= room.capacity) {
      socket.emit('meeting:error', `Phòng đã đầy (${room.capacity} người)`)
      console.log(`Room ${code} is full: ${current}/${room.capacity}`)
      return
    }
    
    socket.join(code)
    socket.data = { userId, displayName, code }
    
    console.log(`${socket.id} joined room ${code} as ${displayName}. Room now has ${current + 1} participants`)
    
    io.to(code).emit('meeting:system', `${displayName} đã tham gia phòng`)
    socket.emit('meeting:joined', { code })
  } catch (e) {
    console.error(`Error joining room:`, e)
    socket.emit('meeting:error', 'Lỗi tham gia phòng')
  }
}

/**
 * Handle meeting:chat event
 */
async function handleChat(io, socket, { code, message, senderId, displayName }) {
  if (!code) return
  
  io.to(code).emit('meeting:chat', { message, displayName, at: Date.now() })
  
  try {
    const room = await MeetingRoom.findOne({ code })
    if (room) {
      await Message.create({ 
        content: message, 
        meeting: room._id, 
        toUser: null, 
        sender: senderId 
      })
    }
  } catch (err) {
    console.error('Error saving chat message:', err)
  }
}

/**
 * Handle meeting:raise-hand event
 */
function handleRaiseHand(io, socket, { code, userId, displayName }) {
  io.to(code).emit('meeting:raise-hand', { userId, displayName })
}

/**
 * Handle meeting:youtube event (YouTube synchronization)
 */
function handleYouTube(io, socket, { code, action, payload }) {
  socket.to(code).emit('meeting:youtube', { action, payload })
}

/**
 * Handle meeting:media event (mic/cam status)
 */
function handleMedia(io, socket, { code, userId, displayName, videoEnabled, audioEnabled }) {
  io.to(code).emit('meeting:media', { 
    userId, 
    displayName, 
    videoEnabled, 
    audioEnabled, 
    socketId: socket.id 
  })
}

/**
 * Register all meeting-related socket handlers
 */
function registerMeetingHandlers(io, socket) {
  socket.on('meeting:join', (data) => handleJoinMeeting(io, socket, data))
  socket.on('meeting:chat', (data) => handleChat(io, socket, data))
  socket.on('meeting:raise-hand', (data) => handleRaiseHand(io, socket, data))
  socket.on('meeting:youtube', (data) => handleYouTube(io, socket, data))
  socket.on('meeting:media', (data) => handleMedia(io, socket, data))
}

module.exports = {
  registerMeetingHandlers,
  handleJoinMeeting,
  handleChat,
  handleRaiseHand,
  handleYouTube,
  handleMedia
}
