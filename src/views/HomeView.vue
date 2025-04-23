<template>
  <div class="home">
    <!-- Pass selectedOrganismId or details from store to InfoPanel -->
    <ThreeCanvas ref="threeCanvas" @organism-selected="handleOrganismSelected" />
    <ControlPanel />
    <!-- Pass selected organism data from Vuex getter or local computed prop -->
    <InfoPanel :selected-organism="selectedOrganismDetails" />
    <!-- TimeControls now reads directly from Vuex -->
    <TimeControls />
    <!-- DataChart reads stats from Vuex -->
    <DataChart :chart-data="chartDataFromStore" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import ThreeCanvas from '@/components/ThreeCanvas.vue';
import ControlPanel from '@/components/ControlPanel.vue';
import InfoPanel from '@/components/InfoPanel.vue';
import TimeControls from '@/components/TimeControls.vue';
import DataChart from '@/components/DataChart.vue';

export default {
  name: 'HomeView',
  components: {
    ThreeCanvas,
    ControlPanel,
    InfoPanel,
    TimeControls,
    DataChart,
  },
  data() {
    return {
      // selectedOrganism is now primarily managed by Vuex (selectedOrganismId)
      // We might keep a local copy for detailed display if needed, fetched via getter/action
      // chartData is now derived from Vuex state via computed property
      statsInterval: null,
      maxDataPoints: 30, // Keep this for chart display logic
    };
  },
  computed: {
    // Map state from the 'ecosystem' module
    ...mapState('ecosystem', {
      // isPaused: state => state.isPaused, // No longer needed directly if TimeControls handles it
      // speed: state => state.speed,       // No longer needed directly if TimeControls handles it
      selectedOrganismId: state => state.selectedOrganismId,
      rawStats: state => state.stats, // Get the raw stats object
    }),

    // Example getter if you implement fetching details in Vuex
    // ...mapGetters('ecosystem', ['selectedOrganismDetails']),

    // Temporary computed property to simulate fetching details based on ID
    // Replace this with a proper getter or action call later
    selectedOrganismDetails() {
      if (this.selectedOrganismId && this.$refs.threeCanvas) {
        // Ideally, fetch from Vuex store's organism map or via getter
        // For now, try to get it from ThreeCanvas (less ideal)
        return this.$refs.threeCanvas.getOrganismById(this.selectedOrganismId);
      }
      return null;
    },

    // Transform Vuex stats into the format required by DataChart
    chartDataFromStore() {
      const labels = this.rawStats.history?.map(s => s.time.toFixed(1)) || [];
      const plantData = this.rawStats.history?.map(s => s.plantCount) || [];
      const herbivoreData = this.rawStats.history?.map(s => s.herbivoreCount) || [];
      const carnivoreData = this.rawStats.history?.map(s => s.carnivoreCount) || [];

      // Apply maxDataPoints limit if necessary (can also be done in the store mutation)
      const limitedLabels = labels.slice(-this.maxDataPoints);
      const limitedPlantData = plantData.slice(-this.maxDataPoints);
      const limitedHerbivoreData = herbivoreData.slice(-this.maxDataPoints);
      const limitedCarnivoreData = carnivoreData.slice(-this.maxDataPoints);

      return {
        labels: limitedLabels,
        datasets: [
          {
            label: '植物',
            borderColor: '#00FF00',
            data: limitedPlantData,
            fill: false,
            tension: 0.1
          },
          {
            label: '食草动物',
            borderColor: '#0000FF',
            data: limitedHerbivoreData,
            fill: false,
            tension: 0.1
          },
          {
            label: '食肉动物',
            borderColor: '#FF0000',
            data: limitedCarnivoreData,
            fill: false,
            tension: 0.1
          }
        ]
      };
    }
  },
  methods: {
    // Map actions from the 'ecosystem' module
    ...mapActions('ecosystem', [
      'selectOrganism', // Action to set the selected organism ID in store
      'updateSimulationStats', // Action to update stats in store
      // No need to map pause/resume/setSpeed here as TimeControls will handle them
    ]),

    handleOrganismSelected(organism) {
      // Dispatch action to update selected organism ID in Vuex
      this.selectOrganism(organism ? organism.id : null);
      console.log('Organism selected ID set in Vuex:', organism ? organism.id : null);
    },

    // This method now fetches stats from ThreeCanvas and dispatches to Vuex
    // Consider moving stats update logic entirely into Ecosystem/ThreeCanvas
    // and have it dispatch the action directly.
    pollStats() {
      if (this.$refs.threeCanvas) {
        const stats = this.$refs.threeCanvas.getSimulationStats();
        if (stats) {
          this.updateSimulationStats(stats); // Dispatch action to update store
        }
      }
    },
  },
  mounted() {
    // Start polling for stats - consider a better approach later
    this.statsInterval = setInterval(this.pollStats, 2000);
  },
  beforeDestroy() {
    // Clear interval when component is destroyed
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }
};
</script>

<style scoped>
.home {
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Ensure canvas takes full space */
  position: relative; /* Needed for absolute positioning of child panels */
}
</style>
