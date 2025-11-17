// Socket.IO Server Initialization
const { Server } = require('socket.io')
const { registerSocketHandlers } = require('./handlers')

/**
 * Initialize Socket.IO server with handlers
 * @param {http.Server} server - HTTP server instance
 * @returns {SocketIO.Server} Socket.IO server instance
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: { 
      origin: '*', 
      methods: ['GET', 'POST'] 
    }
  })

  // Register connection handler
  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket)
  })

  return io
}

module.exports = { initSocket }
