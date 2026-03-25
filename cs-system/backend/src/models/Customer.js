const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  avatar: String,
  phone: String,
  gamePrefs: [String], // 游戏偏好
  totalSessions: { type: Number, default: 0 },
  lastOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  level: { type: String, enum: ['NORMAL', 'VIP', 'SVIP'], default: 'NORMAL' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
