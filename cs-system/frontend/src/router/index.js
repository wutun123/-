import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../components/Layout.vue';
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
import AgentWorkspace from '../components/AgentWorkspace.vue';
import Sessions from '../components/Sessions.vue';
import Agents from '../components/Agents.vue';
import AllocationRules from '../components/AllocationRules.vue';
import Messages from '../components/Messages.vue';
import Stats from '../components/Stats.vue';

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'workspace', component: AgentWorkspace },
      { path: 'sessions', component: Sessions },
      { path: 'agents', component: Agents },
      { path: 'rules', component: AllocationRules },
      { path: 'messages', component: Messages },
      { path: 'stats', component: Stats }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
