const AllocationRule = require('../models/AllocationRule');

class RuleService {
  /**
   * 获取所有启用的规则
   */
  async getEnabledRules() {
    return AllocationRule.find({ enabled: true }).sort({ priority: -1 });
  }

  /**
   * 获取所有规则
   */
  async getAllRules() {
    return AllocationRule.find({}).sort({ priority: -1 });
  }

  /**
   * 保存规则配置
   */
  async saveRules(rules) {
    // 删除所有现有规则
    await AllocationRule.deleteMany({});

    // 插入新规则
    const newRules = rules.map((rule, index) => ({
      ...rule,
      priority: rules.length - index // 优先级倒序
    }));

    return AllocationRule.insertMany(newRules);
  }

  /**
   * 更新单条规则
   */
  async updateRule(ruleId, data) {
    return AllocationRule.findByIdAndUpdate(ruleId, data, { new: true });
  }

  /**
   * 启用/禁用规则
   */
  async toggleRule(ruleId, enabled) {
    return AllocationRule.findByIdAndUpdate(
      ruleId,
      { enabled },
      { new: true }
    );
  }
}

module.exports = new RuleService();
