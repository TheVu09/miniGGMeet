// WebRTC Socket Handler

/**
 * Handle webrtc:signal event (offer/answer/ICE candidates)
 */
function handleSignal(io, socket, { code, to, data }) {
  console.log(`📡 Signal from ${socket.id} to ${to}: ${data.sdp?.type || 'ICE candidate'}`)
  socket.to(to).emit('webrtc:signal', { from: socket.id, data })
}

/**
 * Handle webrtc:ready event
 * Notifies new peer about existing peers and broadcasts new peer to room
 */
function handleReady(io, socket, { code }) {
  console.log(`🎥 WebRTC ready from socket ${socket.id} (${socket.data?.displayName}) in room ${code}`)
  
  // Send list of existing peers to the newcomer
  const room = io.sockets.adapter.rooms.get(code)
  
  if (room) {
    console.log(`📋 Room ${code} has ${room.size} participants`)
    
    room.forEach((socketId) => {
      if (socketId !== socket.id) {
        const peer = io.sockets.sockets.get(socketId)
        if (peer && peer.data) {
          console.log(`  ➡️ Notifying ${socket.id} about existing peer ${socketId} (${peer.data.displayName})`)
          // Notify newcomer about existing peer
          socket.emit('webrtc:peer-join', { id: socketId, info: peer.data })
        }
      }
    })
  }
  
  // Broadcast newcomer to existing peers
  console.log(`  📢 Broadcasting to room ${code} about new peer ${socket.id}`)
  socket.to(code).emit('webrtc:peer-join', { id: socket.id, info: socket.data })
}

/**
 * Handle peer disconnection
 * Notifies other peers to cleanup connection and remove video tile
 */
function handleDisconnecting(io, socket) {
  console.log(`🚪 Socket ${socket.id} (${socket.data?.displayName}) is disconnecting`)
  
  const rooms = [...socket.rooms].filter((r) => r !== socket.id)
  
  rooms.forEach((code) => {
    console.log(`  📢 Notifying room ${code} about peer leaving`)
    io.to(code).emit('meeting:system', `${socket?.data?.displayName || 'Ai đó'} đã rời phòng`)
    // Notify other clients to remove peer connection and tile
    io.to(code).emit('webrtc:peer-left', { id: socket.id })
  })
}

/**
 * Register all WebRTC-related socket handlers
 */
function registerWebRTCHandlers(io, socket) {
  socket.on('webrtc:signal', (data) => handleSignal(io, socket, data))
  socket.on('webrtc:ready', (data) => handleReady(io, socket, data))
  socket.on('disconnecting', () => handleDisconnecting(io, socket))
}

module.exports = {
  registerWebRTCHandlers,
  handleSignal,
  handleReady,
  handleDisconnecting
}
