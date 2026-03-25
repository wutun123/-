<template>
  <div class="layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo">客服系统</div>
        <el-menu :default-active="activeMenu" router background-color="#1a1a2e" text-color="#fff" active-text-color="#667eea">
          <el-menu-item index="/workspace">
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/sessions">
            <span>会话管理</span>
          </el-menu-item>
          <el-menu-item index="/agents">
            <span>客服管理</span>
          </el-menu-item>
          <el-menu-item index="/rules">
            <span>分配规则</span>
          </el-menu-item>
          <el-menu-item index="/messages">
            <span>聊天记录</span>
          </el-menu-item>
          <el-menu-item index="/stats">
            <span>数据统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <span class="breadcrumb">{{ breadcrumb }}</span>
          </div>
          <div class="header-right">
            <span class="agent-name">{{ agentName }}</span>
            <el-dropdown @command="handleCommand">
              <span class="user-menu">
                <el-avatar :size="32" :icon="userIcon" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      userIcon: 'user-filled'
    };
  },
  computed: {
    activeMenu() {
      return this.$route.path;
    },
    breadcrumb() {
      const map = {
        '/workspace': '工作台',
        '/sessions': '会话管理',
        '/agents': '客服管理',
        '/rules': '分配规则',
        '/messages': '聊天记录',
        '/stats': '数据统计'
      };
      return map[this.$route.path] || '';
    },
    agentName() {
      return this.$store.state.agentName || '客服';
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.$store.commit('SET_TOKEN', '');
        this.$router.push('/login');
      } else if (command === 'profile') {
        this.$router.push('/profile');
      }
    }
  }
};
</script>

<style scoped>
.layout {
  height: 100vh;
  background: #f0f2f5;
}

.sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  height: 64px;
}

.header-left .breadcrumb {
  color: #555;
  font-size: 15px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.agent-name {
  color: #333;
  font-size: 14px;
}

.user-menu {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
