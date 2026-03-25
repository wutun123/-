const mongoose = require('mongoose');

const allocationRuleSchema = new mongoose.Schema({
  ruleType: {
    type: String,
    enum: ['ROUND_ROBIN', 'LEAST_LOAD', 'WEIGHT', 'GROUP_MATCH'],
    required: true
  },
  ruleValue: mongoose.Schema.Types.Mixed,
  priority: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AllocationRule', allocationRuleSchema);
