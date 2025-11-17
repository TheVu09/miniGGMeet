// Client logic cho phòng họp: Socket.IO + WebRTC mesh tối giản (MVP)
const socket = io()
const state = {
    pcPeers: {},
    localStream: null,
    screenStream: null,
    recording: null,
    mediaRecorder: null,
    peers: {}, // id -> {displayName}
}

const code = window.__MEETING__.code
const self = window.__MEETING__.user

// UI elements
const chatList = document.getElementById('chatList')
const chatMsg = document.getElementById('chatMsg')
const sendBtn = document.getElementById('sendBtn')
const videoGrid = document.getElementById('videoGrid')
const localVideo = document.getElementById('localVideo')

const ytUrl = document.getElementById('ytUrl')
const ytLoad = document.getElementById('ytLoad')
const ytPause = document.getElementById('ytPause')
const ytEmbed = document.getElementById('ytEmbed')

function addMessage(text) {
    const el = document.createElement('div')
    el.className = 'msg'
    el.textContent = text
    chatList.appendChild(el)
    chatList.scrollTop = chatList.scrollHeight
}

// Tabs
const tabs = document.querySelectorAll('.tabs button')
const tabChat = document.getElementById('tab-chat')
const tabYT = document.getElementById('tab-youtube')

tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
        tabs.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        if (btn.dataset.tab === 'chat') {
            tabChat.classList.remove('hidden')
            tabYT.classList.add('hidden')
        } else {
            tabYT.classList.remove('hidden')
            tabChat.classList.add('hidden')
        }
    })
})

// Socket events
socket.on('connect', () => {
    console.log('🔌 Connected to server, socket ID:', socket.id)
    // Join room first so server sets socket.data before we start WebRTC
    socket.emit('meeting:join', { code, userId: self.id, displayName: self.displayName })
})

socket.on('meeting:joined', async ({ code }) => {
    console.log('✅ Successfully joined room:', code)
    // Now that server confirmed we joined and set socket.data, initialize media
    await initMedia()
})

socket.on('meeting:error', (msg) => {
    console.error('❌ Meeting error:', msg)
    addMessage('[Lỗi] ' + msg)
})

socket.on('meeting:system', (msg) => {
    console.log('📢 System message:', msg)
    addMessage('[Hệ thống] ' + msg)
})

socket.on('meeting:chat', ({ message, displayName, at }) => {
    addMessage(`[${new Date(at).toLocaleTimeString()}] ${displayName}: ${message}`)
})

socket.on('meeting:youtube', ({ action, payload }) => {
    if (action === 'load') {
        ytEmbed.innerHTML = `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${payload}?enablejsapi=1&autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    }
    if (action === 'pause') {
        const iframe = ytEmbed.querySelector('iframe')
        if (iframe) {
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*')
        }
    }
})

// Handle disconnect - cleanup peer connections
socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server')
    // Close all peer connections
    Object.keys(state.pcPeers).forEach(id => {
        if (state.pcPeers[id]) {
            state.pcPeers[id].close()
            console.log('🔒 Closed peer connection:', id)
        }
    })
    state.pcPeers = {}
    state.peers = {}
    
    // Remove all remote peer tiles (keep local tile)
    const peerTiles = videoGrid.querySelectorAll('.video-tile:not(#tile-local)')
    peerTiles.forEach(tile => {
        console.log('🗑️ Removing peer tile:', tile.id)
        tile.remove()
    })
})

// Handle peer leaving - cleanup their connection and tile
socket.on('webrtc:peer-left', ({ id }) => {
    console.log('👋 Peer left:', id)
    
    // Close and remove peer connection
    if (state.pcPeers[id]) {
        state.pcPeers[id].close()
        delete state.pcPeers[id]
        console.log('🔒 Closed peer connection for:', id)
    }
    
    // Remove peer info
    if (state.peers[id]) {
        delete state.peers[id]
    }
    
    // Remove peer's video tile
    const peerTile = document.getElementById('tile-peer-' + id)
    if (peerTile) {
        peerTile.remove()
        console.log('🗑️ Removed peer tile:', id)
    }
})

// WebRTC signalling
socket.on('webrtc:peer-join', ({ id, info }) => {
    console.log('👥 Peer joined:', id, info)
    
    // Don't create peer connection for ourselves
    if (id === socket.id) {
        console.log('⏭️ Skipping peer-join for self:', id)
        return
    }
    
    state.peers[id] = { displayName: info?.displayName || 'Người dùng' }
    if (!state.pcPeers[id]) {
        console.log('🔗 Creating peer connection for:', id)
        createPeer(id, true)
    } else {
        console.log('⚠️ Peer connection already exists for:', id)
    }
})

socket.on('webrtc:signal', async ({ from, data }) => {
    console.log('📡 Signal from:', from, 'type:', data.sdp?.type || 'candidate')
    
    // Don't process signals from ourselves
    if (from === socket.id) {
        console.log('⏭️ Skipping signal from self:', from)
        return
    }
    
    let pc = state.pcPeers[from]
    if (!pc) {
        console.log('🔗 Creating peer connection (from signal):', from)
        pc = createPeer(from, false)
    }
    
    try {
        if (data.sdp) {
            const offerCollision = data.sdp.type === 'offer' && 
                                   (pc.signalingState !== 'stable' || pc.pendingLocalDescription)
            
            if (offerCollision) {
                console.log('⚠️ Offer collision detected with:', from)
                // For simplicity, the peer with lower socket ID backs off
                const polite = socket.id < from
                if (!polite) {
                    console.log('🔄 Ignoring offer (not polite)')
                    return
                }
                console.log('🔄 Accepting offer (polite)')
            }
            
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
            console.log('✅ Set remote description:', data.sdp.type, 'from:', from)
            
            if (data.sdp.type === 'offer') {
                await pc.setLocalDescription()
                socket.emit('webrtc:signal', { code, to: from, data: { sdp: pc.localDescription } })
                console.log('📤 Sent answer to:', from)
            }
        } else if (data.candidate) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                console.log('✅ Added ICE candidate from:', from)
            } catch (e) { 
                console.log('⚠️ Error adding ICE candidate:', e.message)
            }
        }
    } catch (err) {
        console.error('❌ Error processing signal from:', from, err)
    }
})

async function initMedia() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        state.localStream = stream
        
        // Set srcObject and wait for metadata to load
        localVideo.srcObject = stream
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            if (localVideo.readyState >= 2) {
                resolve()
            } else {
                localVideo.onloadedmetadata = () => resolve()
            }
        })
        
        // Ensure video plays
        try {
            await localVideo.play()
            console.log('🎥 Local video playing')
        } catch (playErr) {
            console.warn('⚠️ Autoplay prevented, will play on user interaction:', playErr)
            // Try to play on first user interaction
            document.addEventListener('click', () => localVideo.play(), { once: true })
        }
        
        // Update local tile state
        const localTile = document.getElementById('tile-local')
        if (localTile) {
            localTile.classList.remove('video-off')
        }
        
        // Set avatar display for local user
        const avatarLocal = document.getElementById('avatar-local')
        if (avatarLocal) {
            setAvatarDisplay(avatarLocal, self.displayName)
        }
        
        console.log('🎥 Local media initialized, emitting webrtc:ready')
    } catch (e) {
        console.error('❌ Cannot access camera/mic:', e)
        addMessage('⚠️ Không thể truy cập camera/mic. Bạn sẽ chỉ nghe/xem được người khác.')
        // Show avatar if camera fails
        const localTile = document.getElementById('tile-local')
        if (localTile) localTile.classList.add('video-off')
        
        // Set avatar display even without camera
        const avatarLocal = document.getElementById('avatar-local')
        if (avatarLocal) {
            setAvatarDisplay(avatarLocal, self.displayName)
        }
    } finally {
        // ALWAYS emit webrtc:ready, even if camera/mic failed
        // This allows user to still receive other peers' streams
        console.log('📡 Emitting webrtc:ready')
        socket.emit('webrtc:ready', { code })
    }
}

function createPeer(id, isInitiator) {
    console.log('🚀 Creating peer connection for:', id, 'isInitiator:', isInitiator)
    const pc = new RTCPeerConnection({ 
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'unified-plan'
    })
    state.pcPeers[id] = pc
    
    let makingOffer = false
    
    // Thêm log cho trạng thái kết nối
    pc.onconnectionstatechange = () => {
        console.log(`📡 Peer ${id} connection state:`, pc.connectionState)
    }
    
    pc.oniceconnectionstatechange = () => {
        console.log(`🧊 Peer ${id} ICE connection state:`, pc.iceConnectionState)
    }
    
    pc.onsignalingstatechange = () => {
        console.log(`🤝 Peer ${id} signaling state:`, pc.signalingState)
    }
    
    pc.onicecandidate = (e) => {
        if (e.candidate) {
            console.log(`🧊 Sending ICE candidate to ${id}:`, {
                type: e.candidate.type,
                protocol: e.candidate.protocol,
                address: e.candidate.address
            })
            socket.emit('webrtc:signal', { 
                code, 
                to: id, 
                data: { candidate: e.candidate } 
            })
        }
    }
    
    if (state.localStream) {
        const tracks = state.localStream.getTracks()
        console.log('📤 Local stream has', tracks.length, 'tracks:', tracks.map(t => `${t.kind}:${t.enabled}`).join(', '))
        tracks.forEach((t) => {
            console.log('➕ Adding track to peer:', id, t.kind, 'enabled:', t.enabled, 'readyState:', t.readyState)
            const sender = pc.addTrack(t, state.localStream)
            console.log('✅ Track added, sender:', sender ? 'OK' : 'FAILED')
        })
    } else {
        console.error('❌ No local stream when creating peer:', id)
    }

    pc.onicecandidate = (e) => {
        if (e.candidate) {
            console.log('🧊 Sending ICE candidate to:', id)
            socket.emit('webrtc:signal', { code, to: id, data: { candidate: e.candidate } })
        }
    }
    
    pc.onconnectionstatechange = () => {
        console.log('🔄 Connection state with', id, ':', pc.connectionState)
    }
    
    pc.ontrack = (e) => {
        console.log('📥 Received track from:', id, e.track.kind)
        let vid = document.getElementById('peer-' + id)
        if (!vid) {
            const tile = document.createElement('div')
            tile.className = 'video-tile'
            tile.id = 'tile-peer-' + id
            vid = document.createElement('video')
            vid.id = 'peer-' + id
            vid.autoplay = true
            vid.playsInline = true
            const avatar = document.createElement('div')
            avatar.className = 'avatar'
            const name = document.createElement('div')
            name.className = 'name-tag'
            name.textContent = (state.peers[id]?.displayName) || 'Người dùng'
            tile.appendChild(vid)
            tile.appendChild(avatar)
            tile.appendChild(name)
            tile.addEventListener('click', () => toggleExpand(tile))
            videoGrid.appendChild(tile)
            setAvatarDisplay(avatar, state.peers[id]?.displayName)
        }
        vid.srcObject = e.streams[0]
        console.log('✅ Set srcObject for peer:', id, 'stream tracks:', e.streams[0].getTracks().map(t => t.kind))
        
        // Ensure remote video plays
        vid.play().then(() => {
            console.log('▶️ Remote video playing for:', id)
        }).catch(err => {
            console.warn('⚠️ Remote video autoplay prevented for:', id, err)
        })
        
        // Show video, hide avatar
        const tile = document.getElementById('tile-peer-' + id)
        if (tile) {
            tile.classList.remove('video-off')
            console.log('👁️ Showing video for peer:', id)
        }
        
        // If remote track becomes muted, show avatar
        const track = e.streams[0].getVideoTracks()[0]
        if (track) {
            console.log('📹 Video track for peer:', id, 'enabled:', track.enabled, 'muted:', track.muted)
            track.onmute = () => setTileVideoState('peer-' + id, false)
            track.onunmute = () => setTileVideoState('peer-' + id, true)
        } else {
            console.warn('⚠️ No video track in stream from:', id)
        }
    }

    if (isInitiator) {
        pc.onnegotiationneeded = async () => {
            try {
                if (makingOffer) {
                    console.log('⏳ Already making offer to:', id, 'skipping')
                    return
                }
                makingOffer = true
                console.log('🤝 Negotiation needed with:', id, 'signalingState:', pc.signalingState)
                console.log('   Local senders:', pc.getSenders().map(s => s.track ? `${s.track.kind}:${s.track.enabled}` : 'null').join(', '))
                await pc.setLocalDescription()
                console.log('✅ Created and set local description:', pc.localDescription.type)
                socket.emit('webrtc:signal', { code, to: id, data: { sdp: pc.localDescription } })
                console.log('📤 Sent offer to:', id)
            } catch (err) {
                console.error('❌ Error during negotiation:', err)
            } finally {
                makingOffer = false
            }
        }
    }

    console.log('✅ Peer connection created for:', id)
    return pc
}

// Chat
sendBtn.addEventListener('click', () => {
    const m = chatMsg.value.trim()
    if (!m) return
        socket.emit('meeting:chat', { code, message: m, senderId: self.id, displayName: self.displayName })
    chatMsg.value = ''
})

chatMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBtn.click()
})

// Raise hand
const raiseBtn = document.getElementById('raiseBtn')
raiseBtn.addEventListener('click', () => {
    socket.emit('meeting:raise-hand', { code, userId: self.id, displayName: self.displayName })
})

socket.on('meeting:raise-hand', ({ userId, displayName }) => {
    addMessage(`✋ ${displayName} đã giơ tay`)
})

// Screen share
const screenBtn = document.getElementById('screenBtn')
const screenIcon = screenBtn.querySelector('i')
let sharing = false
let screenTrackEndedHandler = null;

screenBtn.addEventListener('click', async () => {
    if (!sharing) {
        try {
            console.log('🖥️ Bắt đầu chia sẻ màn hình...')

            // Kiểm tra xem đã có stream screen đang chạy không
            if (state.screenStream) {
                state.screenStream.getTracks().forEach(track => track.stop())
            }

            state.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    displaySurface: "monitor",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })

            const videoTrack = state.screenStream.getVideoTracks()[0]
            if (!videoTrack) {
                throw new Error('Không nhận được video track từ màn hình')
            }

            // Lưu trữ track gốc từ camera để khôi phục sau
            if (!state.originalVideoTrack && state.localStream) {
                state.originalVideoTrack = state.localStream.getVideoTracks()[0]
            }

            // Đánh dấu track là screen share
            videoTrack.source = 'screen'

            // Thay thế track trong tất cả các peer connection
            const success = await replaceTrack(videoTrack)
            if (!success) {
                throw new Error('Không thể chia sẻ màn hình với người tham gia khác')
            }

            // Cập nhật UI
            sharing = true
            screenBtn.title = 'Dừng chia sẻ'
            screenBtn.setAttribute('aria-pressed', 'true')
            if (screenIcon) screenIcon.className = 'bi bi-display-fill'

            // Thông báo cho người dùng khác
            socket.emit('meeting:media', {
                code,
                userId: self.id,
                displayName: self.displayName,
                videoEnabled: true,
                isScreenShare: true
            })

            // Xử lý khi người dùng dừng chia sẻ qua nút Stop sharing của trình duyệt
            if (screenTrackEndedHandler) {
                videoTrack.removeEventListener('ended', screenTrackEndedHandler)
            }

            screenTrackEndedHandler = async () => {
                console.log('🛑 Người dùng đã dừng chia sẻ màn hình qua nút Stop sharing')
                await stopShare()
            }

            videoTrack.addEventListener('ended', screenTrackEndedHandler)

            // Kiểm tra track định kỳ
            startScreenShareMonitoring()

            addMessage('[Hệ thống] Bạn đã bắt đầu chia sẻ màn hình')
        } catch (error) {
            console.error('❌ Lỗi chia sẻ màn hình:', error)
            if (error.name === 'NotAllowedError') {
                addMessage('[Thông báo] Bạn đã hủy chia sẻ màn hình')
            } else {
                addMessage('[Lỗi] Không thể chia sẻ màn hình: ' + (error.message || 'Đã có lỗi xảy ra'))
            }
            await stopShare()
        }
    } else {
        await stopShare()
    }
})

// Biến để theo dõi trạng thái screen share
let screenShareMonitorInterval = null;

function startScreenShareMonitoring() {
    if (screenShareMonitorInterval) {
        clearInterval(screenShareMonitorInterval)
    }
    
    screenShareMonitorInterval = setInterval(() => {
        if (sharing && (!state.screenStream || !state.screenStream.active || state.screenStream.getVideoTracks()[0]?.readyState === 'ended')) {
            console.log('🔍 Phát hiện screen share đã dừng qua monitoring')
            stopShare()
        }
    }, 1000)
}

function stopScreenShareMonitoring() {
    if (screenShareMonitorInterval) {
        clearInterval(screenShareMonitorInterval)
        screenShareMonitorInterval = null
    }
}

async function stopShare() {
    try {
        console.log('🛑 Dừng chia sẻ màn hình...')
        
        // Dừng monitoring
        stopScreenShareMonitoring()
        
        // Dừng tất cả các track của screen share
        if (state.screenStream) {
            state.screenStream.getTracks().forEach(track => {
                track.stop()
                console.log('✅ Đã dừng track screen share:', track.kind)
            })
            state.screenStream = null
        }

        // Khôi phục track camera gốc
        if (state.originalVideoTrack) {
            console.log('🎥 Khôi phục track camera...')
            state.originalVideoTrack.source = 'camera'
            
            try {
                await replaceTrack(state.originalVideoTrack)
                console.log('✅ Đã khôi phục track camera thành công')
            } catch (trackError) {
                console.error('❌ Lỗi khôi phục track camera:', trackError)
                // Thử khởi tạo lại camera nếu khôi phục thất bại
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true })
                    const newVideoTrack = newStream.getVideoTracks()[0]
                    newVideoTrack.source = 'camera'
                    await replaceTrack(newVideoTrack)
                    state.originalVideoTrack = newVideoTrack
                    console.log('✅ Đã khởi tạo lại camera thành công')
                } catch (newStreamError) {
                    console.error('❌ Không thể khởi tạo lại camera:', newStreamError)
                }
            }
        }

        // Cập nhật trạng thái và UI
        sharing = false
        screenBtn.title = 'Chia sẻ màn hình'
        screenBtn.setAttribute('aria-pressed', 'false')
        if (screenIcon) screenIcon.className = 'bi bi-display'

        // Thông báo cho người dùng khác
        socket.emit('meeting:media', {
            code,
            userId: self.id,
            displayName: self.displayName,
            videoEnabled: getLocalVideoEnabled(),
            isScreenShare: false
        })

        // Xóa event listener
        if (screenTrackEndedHandler && state.screenStream?.getVideoTracks()[0]) {
            state.screenStream.getVideoTracks()[0].removeEventListener('ended', screenTrackEndedHandler)
            screenTrackEndedHandler = null
        }

        addMessage('[Hệ thống] Bạn đã dừng chia sẻ màn hình')
    } catch (error) {
        console.error('❌ Lỗi khi dừng chia sẻ màn hình:', error)
        addMessage('[Lỗi] Không thể dừng chia sẻ màn hình hoàn toàn: ' + (error.message || 'Đã có lỗi xảy ra'))
        // Reset trạng thái mặc dù có lỗi
        sharing = false
        state.screenStream = null
    }
}

async function replaceTrack(track) {
    try {
        console.log('🔄 Thay thế video track:', {
            kind: track.kind,
            enabled: track.enabled,
            source: track.source,
            readyState: track.readyState,
            muted: track.muted
        })

        // Cập nhật local video trước
        if (track.source === 'screen') {
            localVideo.srcObject = state.screenStream;
        } else {
            localVideo.srcObject = state.localStream;
        }

        // Đảm bảo local video chạy
        try {
            await localVideo.play();
            console.log('✅ Đã cập nhật local video thành công');
        } catch (playError) {
            console.warn('⚠️ Lỗi khi play local video:', playError);
        }

        let success = false;
        const peers = Object.entries(state.pcPeers);
        
        if (peers.length === 0) {
            console.log('⚠️ Không có peer connections nào để thay thế track');
            return true; // Vẫn trả về true vì không có peer không phải là lỗi
        }

        for (const [peerId, pc] of peers) {
            try {
                console.log(`🔄 Đang xử lý peer ${peerId}:`, {
                    connectionState: pc.connectionState,
                    iceConnectionState: pc.iceConnectionState,
                    signalingState: pc.signalingState
                });

                // Kiểm tra trạng thái kết nối
                if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                    console.log(`⚠️ Bỏ qua peer ${peerId} do trạng thái không hợp lệ`);
                    continue;
                }

                const senders = pc.getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');

                if (!videoSender) {
                    console.log(`⚠️ Không tìm thấy video sender cho peer ${peerId}`);
                    // Thử thêm track mới nếu không tìm thấy sender
                    try {
                        pc.addTrack(track, track.source === 'screen' ? state.screenStream : state.localStream);
                        console.log(`✅ Đã thêm track mới cho peer ${peerId}`);
                        success = true;
                    } catch (addError) {
                        console.error(`❌ Lỗi khi thêm track mới cho peer ${peerId}:`, addError);
                    }
                    continue;
                }

                // Thay thế track
                await videoSender.replaceTrack(track);
                console.log(`✅ Đã thay thế track thành công cho peer ${peerId}`);
                success = true;

                // Thử negotiate lại nếu cần
                if (pc.signalingState === 'stable' && track.source === 'screen') {
                    try {
                        await pc.setLocalDescription(await pc.createOffer());
                        console.log(`✅ Đã tạo offer mới cho peer ${peerId}`);
                    } catch (negotiationError) {
                        console.warn(`⚠️ Lỗi khi negotiate với peer ${peerId}:`, negotiationError);
                    }
                }

            } catch (err) {
                console.error(`❌ Lỗi xử lý peer ${peerId}:`, err);
                // Tiếp tục với peer tiếp theo
            }
        }

        // Cập nhật UI
        const localTile = document.getElementById('tile-local');
        if (localTile) {
            if (track.source === 'screen') {
                localTile.classList.add('screen-sharing');
            } else {
                localTile.classList.remove('screen-sharing');
            }
        }

        if (!success) {
            throw new Error('Không thể thay thế track cho bất kỳ peer nào');
        }

        return true;
    } catch (error) {
        console.error('❌ Lỗi thay thế track:', error);
        throw error; // Ném lỗi để hàm gọi có thể xử lý
    }
}

// Toggle mic/cam
const micBtn = document.getElementById('micBtn')
const camBtn = document.getElementById('camBtn')
const micIcon = micBtn.querySelector('i')
const camIcon = camBtn.querySelector('i')
micBtn.addEventListener('click', () => {
    const tracks = state.localStream?.getAudioTracks() || []
    if (tracks.length === 0) return
    const nextEnabled = !tracks[0].enabled
    tracks.forEach((t) => (t.enabled = nextEnabled))
    micBtn.setAttribute('aria-pressed', (!nextEnabled).toString())
    if (micIcon) micIcon.className = nextEnabled ? 'bi bi-mic-fill' : 'bi bi-mic-mute-fill'
    socket.emit('meeting:media', { code, userId: self.id, displayName: self.displayName, videoEnabled: getLocalVideoEnabled(), audioEnabled: nextEnabled })
})
camBtn.addEventListener('click', () => {
    const tracks = state.localStream?.getVideoTracks() || []
    if (tracks.length === 0) return
    const nextEnabled = !tracks[0].enabled
    tracks.forEach((t) => (t.enabled = nextEnabled))
    camBtn.setAttribute('aria-pressed', (!nextEnabled).toString())
    if (camIcon) camIcon.className = nextEnabled ? 'bi bi-camera-video-fill' : 'bi bi-camera-video-off'
    // Toggle local avatar visibility
    setTileVideoState('local', nextEnabled)
    socket.emit('meeting:media', { code, userId: self.id, displayName: self.displayName, videoEnabled: nextEnabled, audioEnabled: getLocalAudioEnabled() })
})

// YouTube controls
ytLoad.addEventListener('click', () => {
    const url = ytUrl.value.trim()
    const id = parseYouTubeId(url)
    if (!id) return
    socket.emit('meeting:youtube', { code, action: 'load', payload: id })
    ytEmbed.innerHTML = `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
})

ytPause.addEventListener('click', () => {
    socket.emit('meeting:youtube', { code, action: 'pause' })
})

function parseYouTubeId(url) {
    const m = url.match(/(?:v=|\.be\/)([A-Za-z0-9_-]{11})/)
    return m ? m[1] : null
}

// Recording (local only)
const recordBtn = document.getElementById('recordBtn')
const recordIcon = recordBtn.querySelector('i')
recordBtn.addEventListener('click', () => {
    if (!state.mediaRecorder) {
        const stream = new MediaStream()
        state.localStream?.getTracks().forEach((t) => stream.addTrack(t))
        const mr = new MediaRecorder(stream)
        const chunks = []
        mr.ondataavailable = (e) => chunks.push(e.data)
        mr.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `recording-${Date.now()}.webm`
            a.click()
        }
        mr.start()
        state.mediaRecorder = mr
        recordBtn.title = 'Dừng ghi'
        recordBtn.setAttribute('aria-pressed', 'true')
        if (recordIcon) recordIcon.className = 'bi bi-stop-circle'
        recordBtn.classList.add('recording')
    } else {
        state.mediaRecorder.stop()
        state.mediaRecorder = null
        recordBtn.title = 'Ghi lại'
        recordBtn.setAttribute('aria-pressed', 'false')
        if (recordIcon) recordIcon.className = 'bi bi-record-circle'
        recordBtn.classList.remove('recording')
    }
})

// Chat toggle
const chatToggleBtn = document.getElementById('chatToggleBtn')
const sidebar = document.querySelector('.sidebar')
const chatToggleIcon = chatToggleBtn.querySelector('i')

chatToggleBtn.addEventListener('click', () => {
    const isHidden = sidebar.classList.toggle('hidden')
    chatToggleBtn.setAttribute('aria-pressed', !isHidden)
    
    if (isHidden) {
        chatToggleBtn.title = 'Mở chat'
        if (chatToggleIcon) chatToggleIcon.className = 'bi bi-chat-dots'
    } else {
        chatToggleBtn.title = 'Đóng chat'
        if (chatToggleIcon) chatToggleIcon.className = 'bi bi-chat-dots-fill'
    }
})

// Layout settings
const layoutRadios = document.querySelectorAll('input[name="layoutMode"]')
const tileCountSlider = document.getElementById('tileCountSlider')
const tileCountValue = document.getElementById('tileCountValue')
const tileCountMin = document.getElementById('tileCountMin')
const tileCountMax = document.getElementById('tileCountMax')
const hideNoVideoCheckbox = document.getElementById('hideNoVideo')

// Load saved preferences
const savedLayout = localStorage.getItem('meetingLayout') || 'auto'
const savedTileCount = localStorage.getItem('meetingTileCount') || '16'
const savedHideNoVideo = localStorage.getItem('meetingHideNoVideo') === 'true'

document.getElementById('layout' + savedLayout.charAt(0).toUpperCase() + savedLayout.slice(1))?.setAttribute('checked', 'true')
tileCountSlider.value = savedTileCount
tileCountValue.textContent = savedTileCount
hideNoVideoCheckbox.checked = savedHideNoVideo

function applyLayout(mode) {
    videoGrid.className = 'video-grid'
    if (mode !== 'auto' && mode !== 'tiled') {
        videoGrid.classList.add('layout-' + mode)
    }
    
    // Adjust grid columns based on tile count
    const count = parseInt(tileCountSlider.value)
    const cols = Math.ceil(Math.sqrt(count))
    if (mode === 'auto' || mode === 'tiled') {
        videoGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(200px, 1fr))`
    }
    
    localStorage.setItem('meetingLayout', mode)
    console.log('📐 Layout changed to:', mode)
}

function applyTileCount(count) {
    const maxTiles = parseInt(count)
    const tiles = videoGrid.querySelectorAll('.video-tile')
    
    tiles.forEach((tile, index) => {
        if (index >= maxTiles) {
            tile.style.display = 'none'
        } else {
            tile.style.display = ''
        }
    })
    
    localStorage.setItem('meetingTileCount', count)
    console.log('🔢 Max tiles set to:', count)
}

function applyHideNoVideo(hide) {
    const tiles = videoGrid.querySelectorAll('.video-tile:not(#tile-local)')
    
    tiles.forEach((tile) => {
        if (hide && tile.classList.contains('video-off')) {
            tile.style.display = 'none'
        } else {
            tile.style.display = ''
        }
    })
    
    localStorage.setItem('meetingHideNoVideo', hide)
    console.log('👁️ Hide no video:', hide)
}

// Event listeners
layoutRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            applyLayout(e.target.value)
        }
    })
})

tileCountSlider.addEventListener('input', (e) => {
    tileCountValue.textContent = e.target.value
    applyTileCount(e.target.value)
})

tileCountMin.addEventListener('click', () => {
    tileCountSlider.value = tileCountSlider.min
    tileCountValue.textContent = tileCountSlider.min
    applyTileCount(tileCountSlider.min)
})

tileCountMax.addEventListener('click', () => {
    tileCountSlider.value = tileCountSlider.max
    tileCountValue.textContent = tileCountSlider.max
    applyTileCount(tileCountSlider.max)
})

hideNoVideoCheckbox.addEventListener('change', (e) => {
    applyHideNoVideo(e.target.checked)
})

// Apply saved settings on load
applyLayout(savedLayout)
applyTileCount(savedTileCount)
applyHideNoVideo(savedHideNoVideo)

// Helpers
function getLocalVideoEnabled() {
    const tracks = state.localStream?.getVideoTracks() || []
    return tracks.length ? tracks[0].enabled : false
}
function getLocalAudioEnabled() {
    const tracks = state.localStream?.getAudioTracks() || []
    return tracks.length ? tracks[0].enabled : false
}

function setAvatarDisplay(avatarEl, name, avatarUrl) {
    if (avatarUrl) {
        avatarEl.style.backgroundImage = `url('${avatarUrl}')`
        avatarEl.textContent = ''
    } else {
        const initials = (name || '?').trim().split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase()
        avatarEl.style.backgroundImage = ''
        avatarEl.textContent = initials
    }
}

function setTileVideoState(who, enabled) {
    const tileId = who === 'local' ? 'tile-local' : 'tile-' + who
    const tile = document.getElementById(tileId) || document.getElementById('tile-' + who)
    if (!tile) return
    tile.classList.toggle('video-off', !enabled)
}

function toggleExpand(tile) {
    const expanded = document.querySelector('.video-tile.expanded')
    if (expanded && expanded !== tile) expanded.classList.remove('expanded')
    tile.classList.toggle('expanded')
}

// Local tile interactions
document.getElementById('tile-local')?.addEventListener('click', (e) => {
    // avoid clicking buttons overlay (none now), toggle expand
    toggleExpand(e.currentTarget)
})

// After media ready, ensure local avatar content exists
function initLocalAvatar() {
    const avatar = document.getElementById('avatar-local')
    if (!avatar) return
    setAvatarDisplay(avatar, self.displayName, self.avatarUrl)
    // If local video disabled initially, show avatar
    if (!getLocalVideoEnabled()) setTileVideoState('local', false)
}

socket.on('meeting:media', ({ userId, displayName, videoEnabled, audioEnabled, socketId }) => {
    // map socketId to peer video id if provided; otherwise try 'peer-' + socketId
    setTileVideoState('peer-' + socketId, videoEnabled)
})

// call after init media once local stream is set
setTimeout(initLocalAvatar, 500)
