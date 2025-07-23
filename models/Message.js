const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  text: { type: String },
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  imageUrl: { type: String }, // For storing image URLs
  isRead: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String, // Using roomId to identify the chat room
    required: true
  }
})

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
