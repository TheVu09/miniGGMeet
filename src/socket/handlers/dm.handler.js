// Direct Message (1:1 Call) Socket Handler

/**
 * Handle dm:join event
 */
function handleJoinDM(io, socket, { roomId, user }) {
  socket.join('dm:' + roomId)
  socket.to('dm:' + roomId).emit('dm:peer-join', { id: socket.id, user })
}

/**
 * Handle dm:signal event (WebRTC signaling for DM)
 */
function handleDMSignal(io, socket, { roomId, to, data }) {
  socket.to(to).emit('dm:signal', { from: socket.id, data })
}

/**
 * Handle dm:chat event
 */
function handleDMChat(io, socket, { roomId, message, user }) {
  io.to('dm:' + roomId).emit('dm:chat', { 
    message, 
    user, 
    at: Date.now() 
  })
}

/**
 * Register all DM-related socket handlers
 */
function registerDMHandlers(io, socket) {
  socket.on('dm:join', (data) => handleJoinDM(io, socket, data))
  socket.on('dm:signal', (data) => handleDMSignal(io, socket, data))
  socket.on('dm:chat', (data) => handleDMChat(io, socket, data))
}

module.exports = {
  registerDMHandlers,
  handleJoinDM,
  handleDMSignal,
  handleDMChat
}
