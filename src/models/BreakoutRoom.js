const mongoose = require('mongoose')

const breakoutRoomSchema = new mongoose.Schema({
  parentMeeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingRoom',
    required: true,
    index: true
  },
  roomNumber: {
    type: Number,
    required: true,
    min: 1
  },
  roomName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 2,
    max: 50,
    default: 10
  },
  assignedParticipants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignmentType: {
      type: String,
      enum: ['manual', 'random', 'self-select'],
      default: 'manual'
    },
    joinedAt: Date,
    leftAt: Date,
    isPresent: {
      type: Boolean,
      default: false
    }
  }],
  currentParticipantCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['created', 'active', 'closed', 'merged'],
    default: 'created',
    index: true
  },
  settings: {
    allowParticipantsToReturn: {
      type: Boolean,
      default: true
    },
    allowParticipantsToSwitchRooms: {
      type: Boolean,
      default: false
    },
    autoCloseAfterMinutes: {
      type: Number,
      min: 0,
      default: 0 // 0 = no auto close
    },
    allowAudio: {
      type: Boolean,
      default: true
    },
    allowVideo: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    }
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  mergedBackAt: {
    type: Date
  },
  duration: {
    type: Number, // seconds
    default: 0
  },
  chatHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Indexes
breakoutRoomSchema.index({ parentMeeting: 1, roomNumber: 1 })
breakoutRoomSchema.index({ parentMeeting: 1, status: 1 })
breakoutRoomSchema.index({ roomCode: 1 })
breakoutRoomSchema.index({ 'assignedParticipants.user': 1 })

// Update participant count
breakoutRoomSchema.methods.updateParticipantCount = function() {
  this.currentParticipantCount = this.assignedParticipants.filter(p => p.isPresent).length
  return this.save()
}

module.exports = mongoose.model('BreakoutRoom', breakoutRoomSchema)
