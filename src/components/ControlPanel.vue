<template>
  <div class="control-panel">
    <h4>环境控制</h4>
    <!-- Add sliders and buttons for environment parameters here -->
    <!-- Example for Temperature -->
    <div class="control-item">
      <label for="temperature">温度: {{ temperature }}°C</label>
      <input
        type="range"
        id="temperature"
        min="-10"
        max="40"
        step="1"
        :value="temperature"
        @input="updateParam('temperature', $event.target.value)"
      />
    </div>
    <!-- Example for Rainfall -->
    <div class="control-item">
      <label for="rainfall">降雨量: {{ rainfall }}%</label>
      <input
        type="range"
        id="rainfall"
        min="0"
        max="100"
        step="5"
        :value="rainfall"
        @input="updateParam('rainfall', $event.target.value)"
      />
    </div>
    <!-- Add more controls as needed -->
    <!-- <p>控制面板内容待添加...</p> -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ControlPanel',
  computed: {
    // Map state from the 'ecosystem' module
    ...mapState('ecosystem', ['temperature', 'rainfall']),
  },
  methods: {
    // Map actions from the 'ecosystem' module
    ...mapActions('ecosystem', ['updateEnvironmentParam']),

    updateParam(param, value) {
      // Dispatch action to update the specific parameter in the store
      // Ensure value is parsed as a number if necessary
      this.updateEnvironmentParam({ param, value: Number(value) });
    },
  },
};
</script>

<style scoped>
.control-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
  min-width: 200px; /* Give it some width */
}

.control-item {
  margin-bottom: 8px;
}

.control-item label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.control-item input[type="range"] {
  width: 100%;
}
</style>