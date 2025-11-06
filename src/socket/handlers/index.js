// Socket.IO Handler Index - Aggregates all socket handlers

const { registerMeetingHandlers } = require('./meeting.handler')
const { registerWebRTCHandlers } = require('./webrtc.handler')
const { registerDMHandlers } = require('./dm.handler')

/**
 * Register all socket event handlers for a connected socket
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected socket instance
 */
function registerSocketHandlers(io, socket) {
  console.log(`🔌 New connection: ${socket.id}`)
  
  // Register all handler modules
  registerMeetingHandlers(io, socket)
  registerWebRTCHandlers(io, socket)
  registerDMHandlers(io, socket)
}

module.exports = {
  registerSocketHandlers
}
