const mongoose = require('mongoose')

const MeetingRoomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 150 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    youtubeUrl: { type: String }
  },
  { timestamps: true }
)

module.exports = mongoose.model('MeetingRoom', MeetingRoomSchema)
