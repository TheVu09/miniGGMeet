const mongoose = require('mongoose')

const fileShareSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingRoom',
    required: true,
    index: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'video', 'audio', 'document', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
    max: 100 * 1024 * 1024 // 100MB limit
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
fileShareSchema.index({ meeting: 1, uploadedAt: -1 })
fileShareSchema.index({ uploader: 1, uploadedAt: -1 })
fileShareSchema.index({ meeting: 1, isDeleted: 1 })

module.exports = mongoose.model('FileShare', fileShareSchema)
