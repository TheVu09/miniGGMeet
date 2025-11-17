const mongoose = require('mongoose')

const deviceStatusSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingRoom',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Audio settings
  microphoneEnabled: {
    type: Boolean,
    default: true
  },
  microphoneId: {
    type: String,
    trim: true
  },
  microphoneName: {
    type: String,
    trim: true
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  audioLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Video settings
  cameraEnabled: {
    type: Boolean,
    default: true
  },
  cameraId: {
    type: String,
    trim: true
  },
  cameraName: {
    type: String,
    trim: true
  },
  videoQuality: {
    type: String,
    enum: ['low', 'medium', 'high', 'hd'],
    default: 'medium'
  },
  isVideoOff: {
    type: Boolean,
    default: false
  },
  
  // Speaker settings
  speakerEnabled: {
    type: Boolean,
    default: true
  },
  speakerId: {
    type: String,
    trim: true
  },
  speakerName: {
    type: String,
    trim: true
  },
  speakerVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  
  // Screen sharing
  isScreenSharing: {
    type: Boolean,
    default: false
  },
  screenShareStartedAt: {
    type: Date
  },
  
  // Connection status
  connectionStatus: {
    type: String,
    enum: ['connecting', 'connected', 'reconnecting', 'disconnected'],
    default: 'connecting'
  },
  connectionQuality: {
    type: String,
    enum: ['poor', 'fair', 'good', 'excellent'],
    default: 'good'
  },
  bandwidth: {
    download: { type: Number, default: 0 }, // Kbps
    upload: { type: Number, default: 0 }
  },
  
  // Hand raise
  handRaised: {
    type: Boolean,
    default: false
  },
  handRaisedAt: {
    type: Date
  },
  
  // Last update
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
deviceStatusSchema.index({ meeting: 1, user: 1 }, { unique: true })
deviceStatusSchema.index({ meeting: 1, connectionStatus: 1 })

module.exports = mongoose.model('DeviceStatus', deviceStatusSchema)
