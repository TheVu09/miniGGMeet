const socket = io()
const { serverId, channelId, user } = window.__CHANNEL__

const chatList = document.getElementById('chatList')
const chatMsg = document.getElementById('chatMsg')
const sendBtn = document.getElementById('sendBtn')

function addMessage(text) {
  const el = document.createElement('div')
  el.className = 'msg'
  el.textContent = text
  chatList.appendChild(el)
  chatList.scrollTop = chatList.scrollHeight
}

socket.on('connect', () => {
  if (channelId) socket.emit('channel:join', { serverId, channelId, user })
})

socket.on('channel:joined', () => {})
socket.on('channel:error', (msg) => addMessage('[Lỗi] ' + msg))
socket.on('channel:chat', ({ message, user, at }) => {
  addMessage(`[${new Date(at).toLocaleTimeString()}] ${user.displayName}: ${message}`)
})

sendBtn?.addEventListener('click', () => {
  const m = chatMsg.value.trim(); if (!m || !channelId) return
  socket.emit('channel:chat', { serverId, channelId, message: m, user })
  chatMsg.value = ''
})

chatMsg?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendBtn.click() })
