const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  groupType: {
    type: String,
    enum: ['PRE_SALE', 'AFTER_SALE', 'COMPLAINT'],
    default: 'PRE_SALE'
  },
  status: {
    type: String,
    enum: ['WAITING', 'ASSIGNED', 'TRANSFERRING', 'ENDED'],
    default: 'WAITING'
  },
  assignedAt: Date,
  endedAt: Date,
  lastMessageAt: Date
}, { timestamps: true });

sessionSchema.index({ customerId: 1 });
sessionSchema.index({ agentId: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
