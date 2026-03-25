<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">客服系统</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>账号</label>
          <input v-model="username" type="text" placeholder="请输入账号" required />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" required />
        </div>
        <div class="form-item">
          <label>角色</label>
          <select v-model="role">
            <option value="agent">客服</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <button type="submit" class="btn-login">登录</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      role: 'agent'
    };
  },
  methods: {
    handleLogin() {
      this.$store.dispatch('login', {
        username: this.username,
        password: this.password,
        role: this.role
      });
      this.$router.push('/workspace');
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}

.login-box {
  background: rgba(255, 255, 255, 0.98);
  padding: 48px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  width: 420px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-title {
  text-align: center;
  margin-bottom: 36px;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.form-item {
  margin-bottom: 24px;
}

.form-item label {
  display: block;
  margin-bottom: 10px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: #fff;
}

.btn-login {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
  letter-spacing: 0.5px;
}

.btn-login:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.45);
}

.btn-login:active {
  transform: translateY(-1px);
}
</style>
