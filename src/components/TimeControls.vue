<template>
  <div class="time-controls">
    <h4>时间控制</h4>
    <!-- Use Vuex state and actions -->
    <button @click="togglePauseResume">{{ isPaused ? '恢复' : '暂停' }}</button>
    <button @click="decreaseSpeed" :disabled="speed <= 0.1">减速</button>
    <span>速度: {{ speed.toFixed(1) }}x</span>
    <button @click="increaseSpeed">加速</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'TimeControls',
  // Remove props as state is now managed by Vuex
  // props: {
  //   initialSpeed: {
  //     type: Number,
  //     default: 1.0,
  //   },
  //   initialPaused: {
  //     type: Boolean,
  //     default: false,
  //   },
  // },
  // Remove local data as it's now mapped from Vuex state
  // data() {
  //   return {
  //     isPaused: this.initialPaused,
  //     speed: this.initialSpeed,
  //   };
  // },
  computed: {
    // Map state from the 'ecosystem' module
    ...mapState('ecosystem', ['isPaused', 'speed']),
  },
  methods: {
    // Map actions from the 'ecosystem' module
    ...mapActions('ecosystem', [
      'pauseSimulation',
      'resumeSimulation',
      'setSimulationSpeed',
    ]),

    togglePauseResume() {
      // Dispatch the appropriate action based on the current state
      if (this.isPaused) {
        this.resumeSimulation();
      } else {
        this.pauseSimulation();
      }
      // No need to emit events anymore
      // this.$emit(this.isPaused ? 'pause' : 'resume');
    },
    decreaseSpeed() {
      const newSpeed = Math.max(0.1, parseFloat((this.speed - 0.5).toFixed(1)));
      this.setSimulationSpeed(newSpeed); // Dispatch action
      // this.$emit('set-speed', this.speed);
    },
    increaseSpeed() {
      const newSpeed = parseFloat((this.speed + 0.5).toFixed(1));
      this.setSimulationSpeed(newSpeed); // Dispatch action
      // this.$emit('set-speed', this.speed);
    },
  },
  // Remove watchers for props as they are no longer used
  // watch: {
  //   initialPaused(newVal) {
  //       this.isPaused = newVal;
  //   },
  //   initialSpeed(newVal) {
  //       this.speed = newVal;
  //   }
  // }
};
</script>

<style scoped>
.time-controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
  display: flex;
  align-items: center;
}

.time-controls button {
  margin: 0 5px;
}

.time-controls span {
  margin: 0 10px;
  min-width: 60px; /* Ensure space for speed display */
  text-align: center;
}
</style>