const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  groupType: {
    type: String,
    enum: ['PRE_SALE', 'AFTER_SALE', 'COMPLAINT'],
    default: 'PRE_SALE'
  },
  status: {
    type: String,
    enum: ['ONLINE', 'BUSY', 'OFFLINE'],
    default: 'OFFLINE'
  },
  maxConcurrent: { type: Number, default: 10 },
  currentConcurrent: { type: Number, default: 0 },
  weight: { type: Number, default: 1.0 }
}, { timestamps: true });

agentSchema.virtual('isAvailable').get(function() {
  return this.status === 'ONLINE' && this.currentConcurrent < this.maxConcurrent;
});

module.exports = mongoose.model('Agent', agentSchema);
