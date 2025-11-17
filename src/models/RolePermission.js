const mongoose = require('mongoose')

const rolePermissionSchema = new mongoose.Schema({
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
  role: {
    type: String,
    required: true,
    enum: ['host', 'co-host', 'moderator', 'presenter', 'participant'],
    default: 'participant',
    index: true
  },
  permissions: {
    // Meeting control
    canStartMeeting: {
      type: Boolean,
      default: false
    },
    canEndMeeting: {
      type: Boolean,
      default: false
    },
    canLockMeeting: {
      type: Boolean,
      default: false
    },
    
    // Participant management
    canAdmitParticipants: {
      type: Boolean,
      default: false
    },
    canRemoveParticipants: {
      type: Boolean,
      default: false
    },
    canMuteParticipants: {
      type: Boolean,
      default: false
    },
    canMuteAll: {
      type: Boolean,
      default: false
    },
    
    // Content sharing
    canShareScreen: {
      type: Boolean,
      default: true
    },
    canShareFiles: {
      type: Boolean,
      default: true
    },
    canShareWhiteboard: {
      type: Boolean,
      default: false
    },
    
    // Chat & messaging
    canSendChat: {
      type: Boolean,
      default: true
    },
    canSendPrivateChat: {
      type: Boolean,
      default: true
    },
    canDeleteMessages: {
      type: Boolean,
      default: false
    },
    
    // Recording
    canStartRecording: {
      type: Boolean,
      default: false
    },
    canStopRecording: {
      type: Boolean,
      default: false
    },
    
    // Breakout rooms
    canCreateBreakoutRooms: {
      type: Boolean,
      default: false
    },
    canAssignBreakoutRooms: {
      type: Boolean,
      default: false
    },
    canBroadcastToBreakoutRooms: {
      type: Boolean,
      default: false
    },
    
    // Settings
    canChangeSettings: {
      type: Boolean,
      default: false
    },
    canManageRoles: {
      type: Boolean,
      default: false
    },
    canInviteParticipants: {
      type: Boolean,
      default: false
    }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Compound index - one role per user per meeting
rolePermissionSchema.index({ meeting: 1, user: 1 }, { unique: true })
rolePermissionSchema.index({ meeting: 1, role: 1 })

// Set default permissions based on role
rolePermissionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'host':
        // Host has all permissions
        Object.keys(this.permissions).forEach(key => {
          this.permissions[key] = true
        })
        break
      
      case 'co-host':
        // Co-host has most permissions except ending meeting
        Object.keys(this.permissions).forEach(key => {
          this.permissions[key] = key !== 'canEndMeeting'
        })
        break
      
      case 'moderator':
        this.permissions = {
          ...this.permissions,
          canAdmitParticipants: true,
          canRemoveParticipants: true,
          canMuteParticipants: true,
          canMuteAll: true,
          canDeleteMessages: true,
          canInviteParticipants: true
        }
        break
      
      case 'presenter':
        this.permissions = {
          ...this.permissions,
          canShareScreen: true,
          canShareFiles: true,
          canShareWhiteboard: true,
          canSendChat: true,
          canSendPrivateChat: true
        }
        break
      
      case 'participant':
        // Basic permissions only
        this.permissions = {
          canShareScreen: false,
          canShareFiles: true,
          canSendChat: true,
          canSendPrivateChat: true
        }
        break
    }
  }
  next()
})

module.exports = mongoose.model('RolePermission', rolePermissionSchema)
