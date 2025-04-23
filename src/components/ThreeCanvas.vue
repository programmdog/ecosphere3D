<template>
  <div ref="canvasContainer" class="three-canvas-container"></div>
</template>

<script>
import { mapState, mapActions } from 'vuex'; // Import Vuex helpers
import SceneManager from '@/core/SceneManager';
import Ecosystem from '@/core/Ecosystem';
import { Plant } from '@/core/Plant';
import { Herbivore } from '@/core/Herbivore';
import { Carnivore } from '@/core/Carnivore';

export default {
  name: 'ThreeCanvas',
  data() {
    return {
      sceneManager: null,
      ecosystem: null,
      // animationFrameId: null, // Ecosystem or SceneManager might handle its own loop
      statsInterval: null, // Interval for dispatching stats
    };
  },
  computed: {
    // Map state from the 'ecosystem' module
    ...mapState('ecosystem', ['isPaused', 'speed']),
  },
  watch: {
    // Watch for changes in Vuex state and update the ecosystem instance
    isPaused(newValue) {
      if (this.ecosystem) {
        if (newValue) {
          this.ecosystem.pause();
        } else {
          this.ecosystem.resume();
        }
      }
    },
    speed(newValue) {
      if (this.ecosystem) {
        this.ecosystem.setSpeed(newValue);
      }
    },
  },
  mounted() {
    if (this.$refs.canvasContainer) {
      this.sceneManager = new SceneManager(this.$refs.canvasContainer);
      // Pass initial state from Vuex to Ecosystem constructor or an init method
      this.ecosystem = new Ecosystem(this.sceneManager, {
        initialPaused: this.isPaused,
        initialSpeed: this.speed,
      });

      // Initial population (example)
      this.populateInitialEcosystem();

      // Add event listener for clicking
      this.$refs.canvasContainer.addEventListener('click', this.onCanvasClick);

      // Start the ecosystem's internal update loop (if it has one)
      this.ecosystem.start(); // Assuming Ecosystem has a start method
      // SceneManager starts its render loop internally

      // Start dispatching stats periodically
      this.statsInterval = setInterval(this.dispatchStats, 2000); // e.g., every 2 seconds

    } else {
      console.error('Canvas container ref not found.');
    }
  },
  beforeDestroy() {
    // Clear stats interval
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    // Remove event listener
    if (this.$refs.canvasContainer) {
        this.$refs.canvasContainer.removeEventListener('click', this.onCanvasClick);
    }
    // Stop ecosystem loop
    if (this.ecosystem) {
        this.ecosystem.stop(); // Assuming Ecosystem has a stop method
    }
    // Cleanup SceneManager
    if (this.sceneManager) {
      this.sceneManager.cleanup();
      this.sceneManager = null;
    }
    this.ecosystem = null; // Allow garbage collection
  },
  methods: {
    // Map actions from the 'ecosystem' module
    ...mapActions('ecosystem', ['selectOrganism', 'updateSimulationStats']),

    populateInitialEcosystem() {
      // Add some initial organisms
      for (let i = 0; i < 20; i++) {
        this.ecosystem.addOrganism(new Plant());
      }
      for (let i = 0; i < 10; i++) {
        this.ecosystem.addOrganism(new Herbivore());
      }
       for (let i = 0; i < 3; i++) {
        this.ecosystem.addOrganism(new Carnivore());
      }
      console.log('Initial population added.');
      this.dispatchStats(); // Dispatch initial stats
    },

    // Method to get stats and dispatch them to Vuex
    dispatchStats() {
      if (this.ecosystem) {
        const stats = this.ecosystem.getStatistics();
        if (stats) {
          this.updateSimulationStats(stats); // Dispatch action
        }
      }
    },

    // Removed simulationLoop, startSimulationLoop, stopSimulationLoop as Ecosystem handles its loop

    // --- Removed methods previously called by HomeView --- 
    // pauseSimulation() { ... }
    // resumeSimulation() { ... }
    // setSimulationSpeed(speed) { ... }
    // getSimulationStats() { ... } // Replaced by dispatchStats

    // Method to get organism details by ID (used by HomeView computed prop)
    getOrganismById(id) {
        return this.ecosystem ? this.ecosystem.getOrganismById(id) : null;
    },

    onCanvasClick(event) {
      if (!this.sceneManager || !this.ecosystem) return;

      const canvasBounds = this.$refs.canvasContainer.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
      mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.sceneManager.camera);

      const organismMeshes = Array.from(this.sceneManager.meshMap.values());
      const intersects = raycaster.intersectObjects(organismMeshes);

      let selectedId = null;
      if (intersects.length > 0) {
        const firstIntersect = intersects[0].object;
        const organismId = firstIntersect.userData.organismId;

        if (organismId !== undefined) {
          // Verify organism still exists in the ecosystem
          const selectedOrganism = this.ecosystem.getOrganismById(organismId);
          if (selectedOrganism) {
            console.log('Clicked Organism ID:', organismId);
            selectedId = organismId;
          } else {
             console.log('Clicked mesh, but organism not found in ecosystem:', organismId);
          }
        } else {
            console.log('Clicked mesh without organismId:', firstIntersect);
        }
      }

      // Dispatch action to Vuex, whether an organism was clicked or not (null clears selection)
      this.selectOrganism(selectedId);
      // No longer emitting event
      // this.$emit('organism-selected', selectedOrganism);
    }
  }
};
</script>

<style scoped>
.three-canvas-container {
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevent scrollbars if canvas slightly overflows */
}
</style>