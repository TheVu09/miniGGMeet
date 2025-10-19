const { Server } = require('socket.io')
const MeetingRoom = require('../models/MeetingRoom')
const Message = require('../models/Message')

function initSocket (server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`)
    
    // Tham gia phòng họp
    socket.on('meeting:join', async ({ code, userId, displayName }) => {
      console.log(`👤 ${socket.id} (${displayName}) wants to join room ${code}`)
      try {
        const room = await MeetingRoom.findOne({ code, isActive: true })
        if (!room) {
          socket.emit('meeting:error', 'Phòng họp không tồn tại')
          return
        }
        const clients = io.sockets.adapter.rooms.get(code)
        const current = clients ? clients.size : 0
        if (current >= room.capacity) {
          socket.emit('meeting:error', 'Phòng đã đủ 150 người')
          return
        }
        socket.join(code)
        socket.data = { userId, displayName, code }
        console.log(`✅ ${socket.id} joined room ${code} as ${displayName}. Room now has ${current + 1} participants`)
        io.to(code).emit('meeting:system', `${displayName} đã tham gia phòng`)
        socket.emit('meeting:joined', { code })
      } catch (e) {
        console.error(`❌ Error joining room:`, e)
        socket.emit('meeting:error', 'Lỗi tham gia phòng')
      }
    })

    // Chat trong phòng họp
    socket.on('meeting:chat', async ({ code, message, senderId, displayName }) => {
      if (!code) return
      io.to(code).emit('meeting:chat', { message, displayName, at: Date.now() })
      try {
        const room = await MeetingRoom.findOne({ code })
        if (room) {
          await Message.create({ content: message, meeting: room._id, toUser: null, sender: senderId })
        }
      } catch {}
    })

    // Giơ tay
    socket.on('meeting:raise-hand', ({ code, userId, displayName }) => {
      io.to(code).emit('meeting:raise-hand', { userId, displayName })
    })

    // Đồng bộ YouTube (chỉ MVP: phát URL, play/pause/seek)
    socket.on('meeting:youtube', ({ code, action, payload }) => {
      socket.to(code).emit('meeting:youtube', { action, payload })
    })

    // Thông báo trạng thái media (mic/cam) để hiển thị avatar khi tắt cam
    socket.on('meeting:media', ({ code, userId, displayName, videoEnabled, audioEnabled }) => {
      io.to(code).emit('meeting:media', { userId, displayName, videoEnabled, audioEnabled, socketId: socket.id })
    })

    // WebRTC tín hiệu (P2P mesh)
    socket.on('webrtc:signal', ({ code, to, data }) => {
      console.log(`📡 Signal from ${socket.id} to ${to}: ${data.sdp?.type || 'ICE candidate'}`)
      socket.to(to).emit('webrtc:signal', { from: socket.id, data })
    })

    socket.on('webrtc:ready', ({ code }) => {
      console.log(`🎥 WebRTC ready from socket ${socket.id} (${socket.data?.displayName}) in room ${code}`)
      // Gửi danh sách tất cả peers hiện tại cho người mới vào
      const room = io.sockets.adapter.rooms.get(code)
      if (room) {
        console.log(`📋 Room ${code} has ${room.size} participants`)
        room.forEach((socketId) => {
          if (socketId !== socket.id) {
            const peer = io.sockets.sockets.get(socketId)
            if (peer && peer.data) {
              console.log(`  ➡️ Notifying ${socket.id} about existing peer ${socketId} (${peer.data.displayName})`)
              // Thông báo cho người mới về người đang có
              socket.emit('webrtc:peer-join', { id: socketId, info: peer.data })
            }
          }
        })
      }
      // Thông báo cho những người khác về người mới
      console.log(`  📢 Broadcasting to room ${code} about new peer ${socket.id}`)
      socket.to(code).emit('webrtc:peer-join', { id: socket.id, info: socket.data })
    })

    socket.on('disconnecting', () => {
      console.log(`🚪 Socket ${socket.id} (${socket.data?.displayName}) is disconnecting`)
      const rooms = [...socket.rooms].filter((r) => r !== socket.id)
      rooms.forEach((code) => {
        console.log(`  📢 Notifying room ${code} about peer leaving`)
        io.to(code).emit('meeting:system', `${socket?.data?.displayName || 'Ai đó'} đã rời phòng`)
        // Thông báo cho các clients khác xóa peer connection và tile
        io.to(code).emit('webrtc:peer-left', { id: socket.id })
      })
    })

    // ========== DM (1:1) ==========
    socket.on('dm:join', ({ roomId, user }) => {
      socket.join('dm:' + roomId)
      socket.to('dm:' + roomId).emit('dm:peer-join', { id: socket.id, user })
    })
    socket.on('dm:signal', ({ roomId, to, data }) => {
      socket.to(to).emit('dm:signal', { from: socket.id, data })
    })
    socket.on('dm:chat', ({ roomId, message, user }) => {
      io.to('dm:' + roomId).emit('dm:chat', { message, user, at: Date.now() })
    })

    // Đã bỏ Channel chat (tính năng máy chủ)
  })

  return io
}

module.exports = { initSocket }
