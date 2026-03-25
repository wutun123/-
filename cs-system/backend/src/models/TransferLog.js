const mongoose = require('mongoose');

const transferLogSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  fromAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  toAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  reason: String,
  customerNotified: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TransferLog', transferLogSchema);
