const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  senderType: {
    type: String,
    enum: ['CUSTOMER', 'AGENT', 'SYSTEM'],
    required: true
  },
  senderId: mongoose.Schema.Types.ObjectId,
  msgType: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'],
    default: 'TEXT'
  },
  content: String,
  imageUrl: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ sessionId: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
