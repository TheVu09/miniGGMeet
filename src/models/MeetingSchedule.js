const mongoose = require('mongoose')

const meetingScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative'],
      default: 'invited'
    },
    respondedAt: Date
  }],
  scheduledStartTime: {
    type: Date,
    required: true,
    index: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // minutes
    required: true,
    min: 5,
    max: 480 // 8 hours max
  },
  timezone: {
    type: String,
    default: 'Asia/Ho_Chi_Minh'
  },
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'none'],
      default: 'none'
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday
    endDate: Date
  },
  meetingRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingRoom'
  },
  meetingCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    minutesBefore: [{
      type: Number,
      default: [15, 60] // 15 min and 1 hour before
    }],
    sentReminders: [{
      sentAt: Date,
      minutesBefore: Number
    }]
  },
  settings: {
    allowJoinBeforeStart: {
      type: Boolean,
      default: true
    },
    minutesBeforeStart: {
      type: Number,
      default: 10
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    recordMeeting: {
      type: Boolean,
      default: false
    },
    maxParticipants: {
      type: Number,
      min: 2,
      max: 250,
      default: 50
    }
  },
  actualStartTime: Date,
  actualEndTime: Date,
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
})

// Indexes
meetingScheduleSchema.index({ organizer: 1, scheduledStartTime: -1 })
meetingScheduleSchema.index({ 'participants.user': 1, scheduledStartTime: -1 })
meetingScheduleSchema.index({ status: 1, scheduledStartTime: 1 })
meetingScheduleSchema.index({ scheduledStartTime: 1, scheduledEndTime: 1 })

module.exports = mongoose.model('MeetingSchedule', meetingScheduleSchema)
