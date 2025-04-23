import Environment from './Environment';
import { Plant } from './Plant';
import { Herbivore } from './Herbivore';
import { Carnivore } from './Carnivore';
// import * as MathModels from './MathModels'; // Optional: For population dynamics

class Ecosystem {
-   constructor(sceneManager) {
+   constructor(sceneManager, options = {}) {
        this.sceneManager = sceneManager;
        this.environment = new Environment();
        this.plants = [];
        this.herbivores = [];
        this.carnivores = [];
        this.organisms = []; // Combined list for easier iteration
        this.time = 0;
-       this.simulationSpeed = 1;
-       this.isPaused = false;
+       this.simulationSpeed = options.initialSpeed ?? 1;
+       this.isPaused = options.initialPaused ?? false;
        this.lastUpdate = performance.now();
        this.nextOrganismId = 0;
+       this.animationFrameId = null; // ID for the animation frame loop
    }

    _getNextId() {
        return this.nextOrganismId++;
    }

    addOrganism(organism) {
        organism.id = this._getNextId();
        this.organisms.push(organism);

        if (organism instanceof Plant) {
            this.plants.push(organism);
        } else if (organism instanceof Herbivore) {
            this.herbivores.push(organism);
        } else if (organism instanceof Carnivore) {
            this.carnivores.push(organism);
        }

        // Add visual representation to the scene
        if (this.sceneManager) {
            this.sceneManager.addMesh(organism);
        }
    }

    removeOrganism(organism) {
        const index = this.organisms.indexOf(organism);
        if (index > -1) {
            this.organisms.splice(index, 1);
        }

        // Remove from specific type list
        if (organism instanceof Plant) {
            const plantIndex = this.plants.indexOf(organism);
            if (plantIndex > -1) this.plants.splice(plantIndex, 1);
        } else if (organism instanceof Herbivore) {
            const herbivoreIndex = this.herbivores.indexOf(organism);
            if (herbivoreIndex > -1) this.herbivores.splice(herbivoreIndex, 1);
        } else if (organism instanceof Carnivore) {
            const carnivoreIndex = this.carnivores.indexOf(organism);
            if (carnivoreIndex > -1) this.carnivores.splice(carnivoreIndex, 1);
        }

        // Remove visual representation from the scene
        if (this.sceneManager && organism.id != null) {
            this.sceneManager.removeMesh(organism.id);
        }
    }

-   update() {
+   // Renamed to _internalUpdate, called by the animation loop
+   _internalUpdate() {
        if (this.isPaused) return;

        const now = performance.now();
        const deltaTime = ((now - this.lastUpdate) / 1000) * this.simulationSpeed; // Delta time in seconds
        this.lastUpdate = now;
        this.time += deltaTime;

        // 1. Update Environment (e.g., weather changes)
        this.environment.update(deltaTime);

        // 2. Update Organisms (AI, movement, energy, age)
        // Iterate backwards allows safe removal during iteration
        for (let i = this.organisms.length - 1; i >= 0; i--) {
            const organism = this.organisms[i];
            organism.update(deltaTime, this); // Pass ecosystem for context

            // Update visual position/scale if changed
            if (this.sceneManager && organism.id != null) {
                 if (organism.positionChanged) {
                    this.sceneManager.updateObjectPosition(organism.id, organism.position);
                    organism.positionChanged = false; // Reset flag
                 }
                 if (organism.scaleChanged) {
                    this.sceneManager.updateObjectScale(organism.id, organism.size); // Assuming size maps to scale
                    organism.scaleChanged = false; // Reset flag
                 }
            }

            // Check for death
            if (organism.isDead()) {
                this.removeOrganism(organism);
            }
        }

        // 3. Handle Interactions (eating, reproduction)
        this._handleInteractions(deltaTime);

        // 4. Apply Population Dynamics (Optional)
        // MathModels.updatePopulations(this, deltaTime);

        // 5. Handle Births (add new organisms generated during interactions)
        this._handleBirths();

        // 6. Trigger random events (e.g., disasters)
        this.environment.triggerRandomEvents(this, deltaTime);
    }

+   // --- Animation Loop Control ---
+   start() {
+       if (!this.animationFrameId) {
+           console.log("Starting Ecosystem loop");
+           this.lastUpdate = performance.now(); // Reset timestamp when starting
+           const loop = () => {
+               this._internalUpdate();
+               this.animationFrameId = requestAnimationFrame(loop);
+           };
+           this.animationFrameId = requestAnimationFrame(loop);
+       }
+   }
+
+   stop() {
+       if (this.animationFrameId) {
+           console.log("Stopping Ecosystem loop");
+           cancelAnimationFrame(this.animationFrameId);
+           this.animationFrameId = null;
+       }
+   }
+
    _handleInteractions(deltaTime) {
        // Example: Herbivores eating plants
        this.herbivores.forEach(herbivore => {
            if (herbivore.isHungry()) {
                const nearbyPlant = this.findNearestOrganism(herbivore, this.plants, herbivore.perceptionRadius);
                if (nearbyPlant) {
                    herbivore.eat(nearbyPlant, deltaTime);
                }
            }
        });

        // Example: Carnivores hunting herbivores
        this.carnivores.forEach(carnivore => {
            if (carnivore.isHungry()) {
                const nearbyHerbivore = this.findNearestOrganism(carnivore, this.herbivores, carnivore.perceptionRadius);
                if (nearbyHerbivore) {
                    carnivore.hunt(nearbyHerbivore, deltaTime);
                }
            }
            // Example: Herbivores fleeing carnivores
            const nearbyCarnivore = this.findNearestOrganism(carnivore, this.carnivores, carnivore.perceptionRadius * 0.8); // Herbivores might have smaller flee radius
            if(nearbyCarnivore){
                 this.herbivores.forEach(herbivore => {
                    if(herbivore.position.distanceTo(carnivore.position) < herbivore.fleeRadius){
                        herbivore.flee(nearbyCarnivore, deltaTime);
                    }
                 });
            }
        });

        // Example: Reproduction
        // ... logic for finding mates and triggering reproduction ...
    }

    _handleBirths() {
        // Add organisms from a temporary birth queue if needed
    }

    findNearestOrganism(sourceOrganism, targetList, maxDistance) {
        let nearest = null;
        let minDistanceSq = maxDistance * maxDistance;

        targetList.forEach(target => {
            if (target === sourceOrganism || target.isDead()) return; // Don't target self or dead

            const distanceSq = sourceOrganism.position.distanceToSquared(target.position);
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                nearest = target;
            }
        });

        return nearest;
    }

+   getOrganismById(id) {
+       return this.organisms.find(org => org.id === id);
+   }
+
    getOrganismsInRadius(position, radius, listToSearch) {
        const results = [];
        const radiusSq = radius * radius;
        listToSearch.forEach(org => {
            if (!org.isDead() && position.distanceToSquared(org.position) < radiusSq) {
                results.push(org);
            }
        });
        return results;
    }

    // --- Simulation Control ---
    pause() {
        this.isPaused = true;
+       console.log("Ecosystem paused");
    }

    resume() {
        this.isPaused = false;
        this.lastUpdate = performance.now(); // Reset last update time to avoid large jump
+       console.log("Ecosystem resumed");
    }

    setSpeed(speed) {
        this.simulationSpeed = Math.max(0, speed); // Ensure speed is not negative
+       console.log(`Ecosystem speed set to: ${this.simulationSpeed}`);
    }

    // --- Getters for UI --- 
    getStatistics() {
        return {
            time: this.time,
            plantCount: this.plants.length,
            herbivoreCount: this.herbivores.length,
            carnivoreCount: this.carnivores.length,
            totalOrganisms: this.organisms.length,
            environment: this.environment.getState(), // Get current environment state
        };
    }
}

export default Ecosystem;