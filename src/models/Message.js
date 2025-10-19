const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingRoom' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // cho tin nhắn riêng (DM)
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'system'], default: 'text' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', MessageSchema)
