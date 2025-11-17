const socket = io()
const { roomId, user } = window.__DM__
const state = { pc: null, local: null }

const chatList = document.getElementById('chatList')
const chatMsg = document.getElementById('chatMsg')
const sendBtn = document.getElementById('sendBtn')
const videoGrid = document.getElementById('videoGrid')
const localVideo = document.getElementById('localVideo')

function addMessage(t) {
    const el = document.createElement('div')
    el.className = 'msg'
    el.textContent = t
    chatList.appendChild(el)
    chatList.scrollTop = chatList.scrollHeight
}

socket.on('connect', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        state.local = stream
        localVideo.srcObject = stream
    } catch { }
    socket.emit('dm:join', { roomId, user })
})

socket.on('dm:peer-join', ({ id }) => {
    if (!state.pc) createPeer(id, true)
})

socket.on('dm:signal', async ({ from, data }) => {
    if (!state.pc) createPeer(from, false)
    const pc = state.pc
    if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        if (data.sdp.type === 'offer') {
            const ans = await pc.createAnswer()
            await pc.setLocalDescription(ans)
            socket.emit('dm:signal', { roomId, to: from, data: { sdp: pc.localDescription } })
        }
    } else if (data.candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)) } catch { }
    }
})

function createPeer(id, isCaller) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    state.pc = pc
    state.local?.getTracks().forEach(t => pc.addTrack(t, state.local))
    pc.onicecandidate = (e) => { if (e.candidate) socket.emit('dm:signal', { roomId, to: id, data: { candidate: e.candidate } }) }
    pc.ontrack = (e) => {
        let vid = document.getElementById('peer')
        if (!vid) {
            vid = document.createElement('video')
            vid.id = 'peer'
            vid.autoplay = true
            vid.playsInline = true
            videoGrid.appendChild(vid)
        }
        vid.srcObject = e.streams[0]
    }
    if (isCaller) {
        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer)
            socket.emit('dm:signal', { roomId, to: id, data: { sdp: pc.localDescription } })
        }
    }
}

sendBtn.addEventListener('click', () => {
    const m = chatMsg.value.trim(); if (!m) return
    socket.emit('dm:chat', { roomId, message: m, user })
    chatMsg.value = ''
})

socket.on('dm:chat', ({ message, user, at }) => {
    addMessage(`[${new Date(at).toLocaleTimeString()}] ${user.displayName}: ${message}`)
})

const micBtn = document.getElementById('micBtn')
const camBtn = document.getElementById('camBtn')
micBtn.addEventListener('click', () => state.local?.getAudioTracks().forEach(t => t.enabled = !t.enabled))
camBtn.addEventListener('click', () => state.local?.getVideoTracks().forEach(t => t.enabled = !t.enabled))
