import { createStore } from 'vuex';

export default createStore({
  state: {
    agentId: null,
    agentName: '',
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    SET_AGENT(state, payload) {
      state.agentId = payload.agentId;
      state.agentName = payload.agentName;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    }
  },
  actions: {
    login({ commit }, { username, password }) {
      // 实际项目中调用登录接口
      commit('SET_TOKEN', 'mock-token');
      commit('SET_AGENT', { agentId: '1', agentName: username });
    }
  }
});
