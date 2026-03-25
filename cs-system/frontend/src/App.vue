<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
}

#app {
  height: 100vh;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

/* Element Plus 覆盖样式 */
.el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.el-button--primary:hover {
  opacity: 0.9;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) !important;
  border-right: 3px solid #667eea;
}

.el-table th {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  color: #4b5563;
  font-weight: 600;
}

.el-table .el-table__row:hover {
  background: #f9fafb;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
}

.el-dialog__title {
  color: #fff;
  font-weight: 600;
}

.el-dialog__headerbtn .el-dialog__close {
  color: #fff;
}

.el-input__wrapper {
  border-radius: 8px;
}

.el-input__inner:focus {
  border-color: #667eea;
}

.el-select .el-input__wrapper {
  border-radius: 8px;
}

.el-card {
  border: none;
  border-radius: 12px;
}
</style>
