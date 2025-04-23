<template>
  <div class="info-panel">
    <h4>信息面板</h4>
    <!-- Display selected organism info or general stats here -->
    <!-- <p>信息面板内容待添加...</p> -->
    <div v-if="selectedOrganismDetails">
      <h5>选中生物信息</h5>
      <p>ID: {{ selectedOrganismDetails.id }}</p>
      <p>类型: {{ selectedOrganismDetails.type }}</p>
      <p>能量: {{ selectedOrganismDetails.energy ? selectedOrganismDetails.energy.toFixed(2) : 'N/A' }}</p>
      <p>年龄: {{ selectedOrganismDetails.age ? selectedOrganismDetails.age.toFixed(2) : 'N/A' }}</p>
      <p>状态: {{ selectedOrganismDetails.state }}</p>
      <!-- Add more details as needed -->
    </div>
    <div v-else>
       <p>点击场景中的生物以查看信息。</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'InfoPanel',
  // Remove the prop as data now comes from Vuex
  // props: {
  //   selectedOrganism: {
  //     type: Object,
  //     default: null,
  //   },
  // },
  computed: {
    // Map state to get the ID
    ...mapState('ecosystem', ['selectedOrganismId']),

    // Option 1: Use a getter if defined in the store
    // ...mapGetters('ecosystem', ['selectedOrganismDetails']),

    // Option 2: Compute details locally (similar to HomeView, less ideal)
    // This requires access to the main simulation instance or a shared data source.
    // For now, let's assume a getter 'selectedOrganismDetails' exists or will be added.
    // If using local computation, it might look like this (needs access to organism data):
    selectedOrganismDetails() {
      // Placeholder: Ideally, this logic resides in a Vuex getter
      // that accesses the organisms map in the store state.
      // For demonstration, we return a simple object if ID exists.
      if (this.selectedOrganismId) {
         // In a real scenario, you'd fetch the actual organism data from
         // the store based on this.selectedOrganismId
         // e.g., return this.$store.state.ecosystem.organisms[this.selectedOrganismId];
         // For now, just return a mock object structure based on the previous prop usage
         const organismData = this.$store.getters['ecosystem/getOrganismById'](this.selectedOrganismId);
         return organismData || { id: this.selectedOrganismId, type: '未知', state: '加载中...' };
      }
      return null;
    }
  }
  // Add methods if needed for formatting data
};
</script>

<style scoped>
.info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 200px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
}
</style>