// src/store/modules/ecosystem.js
import Vue from 'vue'; // Import Vue for Vue.set if needed later

const state = {
  // 模拟控制
  isPaused: false, // 模拟是否暂停
  speed: 1.0,      // 模拟速度

  // 环境参数
  temperature: 25, // 温度
  rainfall: 50,    // 降雨量 (替代湿度和光照，与ControlPanel一致)
  // lightIntensity: 1000, // 可以稍后添加

  // 生物相关
  selectedOrganismId: null, // 当前选中的生物ID
  organisms: {}, // 存储生物详细信息 { id: { id, type, energy, age, state, ... } }

  // 统计数据
  stats: {
    time: 0,           // 当前模拟时间
    plantCount: 0,
    herbivoreCount: 0,
    carnivoreCount: 0,
    history: [], // 存储历史数据点 { time, plantCount, herbivoreCount, carnivoreCount }
    maxHistoryLength: 30 // 与 HomeView 中的 maxDataPoints 保持一致或协调
  }
};

const mutations = {
  // 模拟控制 Mutations
  SET_PAUSED(state, paused) {
    state.isPaused = paused;
  },
  SET_SPEED(state, speed) {
    state.speed = speed;
  },

  // 环境参数 Mutations
  SET_TEMPERATURE(state, value) {
    state.temperature = value;
  },
  SET_RAINFALL(state, value) {
    state.rainfall = value;
  },
  // SET_LIGHT_INTENSITY(state, value) { ... },

  // 生物相关 Mutations
  SET_SELECTED_ORGANISM_ID(state, id) {
    state.selectedOrganismId = id;
  },
  // 用于更新单个生物的详细信息
  UPDATE_ORGANISM_DETAILS(state, organismDetails) {
    if (organismDetails && organismDetails.id) {
      // 使用 Vue.set 确保响应性，如果 organisms 对象是后续添加的
      Vue.set(state.organisms, organismDetails.id, organismDetails);
    }
  },
  // 用于批量更新或替换生物信息
  SET_ORGANISMS(state, organismsMap) {
    state.organisms = organismsMap;
  },
  REMOVE_ORGANISM(state, organismId) {
    Vue.delete(state.organisms, organismId);
    if (state.selectedOrganismId === organismId) {
      state.selectedOrganismId = null; // 如果删除的是选中的生物，取消选中
    }
  },

  // 统计数据 Mutations
  UPDATE_STATS(state, newStats) {
    // 更新当前统计值
    state.stats.time = newStats.time ?? state.stats.time;
    state.stats.plantCount = newStats.plantCount ?? state.stats.plantCount;
    state.stats.herbivoreCount = newStats.herbivoreCount ?? state.stats.herbivoreCount;
    state.stats.carnivoreCount = newStats.carnivoreCount ?? state.stats.carnivoreCount;

    // 添加到历史记录
    const historyPoint = {
      time: state.stats.time,
      plantCount: state.stats.plantCount,
      herbivoreCount: state.stats.herbivoreCount,
      carnivoreCount: state.stats.carnivoreCount
    };
    state.stats.history.push(historyPoint);

    // 限制历史记录长度
    if (state.stats.history.length > state.stats.maxHistoryLength) {
      state.stats.history.shift();
    }
  },
  RESET_STATS_HISTORY(state) {
    state.stats.history = [];
    state.stats.time = 0;
    // Optionally reset counts too
    // state.stats.plantCount = 0;
    // state.stats.herbivoreCount = 0;
    // state.stats.carnivoreCount = 0;
  }
};

const actions = {
  // 模拟控制 Actions
  pauseSimulation({ commit }) {
    commit('SET_PAUSED', true);
    // TODO: 通知 ThreeCanvas/Ecosystem 实例暂停
  },
  resumeSimulation({ commit }) {
    commit('SET_PAUSED', false);
    // TODO: 通知 ThreeCanvas/Ecosystem 实例恢复
  },
  setSimulationSpeed({ commit }, speed) {
    commit('SET_SPEED', speed);
    // TODO: 通知 ThreeCanvas/Ecosystem 实例更新速度
  },

  // 环境参数 Actions
  updateEnvironmentParam({ commit }, { param, value }) {
    const mutationName = `SET_${param.toUpperCase()}`;
    if (mutations[mutationName]) {
      commit(mutationName, value);
      // TODO: 通知 Ecosystem 实例环境已改变
    } else {
      console.warn(`[Vuex] Unknown environment parameter: ${param}`);
    }
  },

  // 生物相关 Actions
  selectOrganism({ commit, dispatch }, organismId) {
    commit('SET_SELECTED_ORGANISM_ID', organismId);
    // 可选: 如果 organisms map 不完整，可以在这里触发获取详细信息
    // if (organismId && !state.organisms[organismId]) {
    //   dispatch('fetchOrganismDetails', organismId);
    // }
  },
  // 示例: 异步获取生物详情 (需要实现 fetchOrganismDetailsFromBackend)
  // async fetchOrganismDetails({ commit }, organismId) {
  //   try {
  //     const details = await fetchOrganismDetailsFromBackend(organismId);
  //     commit('UPDATE_ORGANISM_DETAILS', details);
  //   } catch (error) {
  //     console.error(`[Vuex] Failed to fetch details for organism ${organismId}:`, error);
  //   }
  // },
  // Action 由 Ecosystem 调用来更新 store 中的生物信息
  syncOrganismUpdate({ commit }, organismData) {
    commit('UPDATE_ORGANISM_DETAILS', organismData);
  },
  syncOrganismRemoval({ commit }, organismId) {
    commit('REMOVE_ORGANISM', organismId);
  },

  // 统计数据 Actions
  updateSimulationStats({ commit }, stats) {
    commit('UPDATE_STATS', stats);
  },
  resetSimulation({ commit }) {
    commit('SET_PAUSED', true); // 暂停模拟
    commit('RESET_STATS_HISTORY');
    commit('SET_ORGANISMS', {}); // 清空生物信息
    commit('SET_SELECTED_ORGANISM_ID', null);
    // TODO: 重置环境参数到默认值?
    // TODO: 通知 Ecosystem 实例重置
  }
};

const getters = {
  // 模拟控制 Getters
  isPaused: state => state.isPaused,
  speed: state => state.speed,

  // 环境参数 Getters
  temperature: state => state.temperature,
  rainfall: state => state.rainfall,
  // lightIntensity: state => state.lightIntensity,

  // 生物相关 Getters
  selectedOrganismId: state => state.selectedOrganismId,
  // 获取选中生物的详细信息
  selectedOrganismDetails: state => {
    return state.selectedOrganismId ? state.organisms[state.selectedOrganismId] : null;
  },
  // 通过 ID 获取生物信息 (供 InfoPanel 或 HomeView 使用)
  getOrganismById: (state) => (id) => {
    return state.organisms[id] || null;
  },
  allOrganisms: state => state.organisms,

  // 统计数据 Getters
  simulationStats: state => state.stats, // 返回整个 stats 对象，包含当前值和历史
  // chartData getter (可以替代 HomeView 中的 computed property)
  chartData: state => ({
    labels: state.stats.history.map(s => s.time.toFixed(1)),
    datasets: [
      {
        label: '植物',
        borderColor: '#00FF00',
        data: state.stats.history.map(s => s.plantCount),
        fill: false,
        tension: 0.1
      },
      {
        label: '食草动物',
        borderColor: '#0000FF',
        data: state.stats.history.map(s => s.herbivoreCount),
        fill: false,
        tension: 0.1
      },
      {
        label: '食肉动物',
        borderColor: '#FF0000',
        data: state.stats.history.map(s => s.carnivoreCount),
        fill: false,
        tension: 0.1
      }
    ]
  })
};

export default {
  namespaced: true, // 启用命名空间
  state,
  mutations,
  actions,
  getters
};