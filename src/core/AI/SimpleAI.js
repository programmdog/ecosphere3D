// src/core/AI/SimpleAI.js

// Define possible states for organisms
export const AI_STATE = {
  IDLE: 'idle',         // Doing nothing
  WANDERING: 'wandering', // Moving randomly
  SEEKING_FOOD: 'seeking_food',
  EATING: 'eating',
  FLEEING: 'fleeing',
  SEEKING_MATE: 'seeking_mate',
  REPRODUCING: 'reproducing',
  DEAD: 'dead' // Although handled by isDead(), might be useful state
};

// Basic AI logic container/helper functions
export class SimpleAI {

  /**
   * Basic wandering behavior.
   * Changes the organism's target direction randomly.
   * @param {Organism} organism The organism to update.
   * @param {number} changeInterval How often (in seconds) to change direction.
   */
  static wander(organism, changeInterval = 5) {
    if (!organism.aiData) organism.aiData = {}; // Initialize AI data if needed

    const now = performance.now() / 1000;
    if (!organism.aiData.lastWanderChange || now - organism.aiData.lastWanderChange > changeInterval) {
      // Choose a random direction (on the XZ plane)
      const angle = Math.random() * Math.PI * 2;
      organism.targetDirection = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
      organism.aiData.lastWanderChange = now;
      // console.log(`${organism.type} #${organism.id} wandering towards`, organism.targetDirection);
    }

    // Move towards the target direction
    organism.move(organism.targetDirection);
  }

  /**
   * Basic seeking behavior.
   * Moves the organism towards a target position.
   * @param {Organism} organism The organism moving.
   * @param {THREE.Vector3} targetPosition The position to move towards.
   */
  static seek(organism, targetPosition) {
    if (!targetPosition) return;
    const direction = targetPosition.clone().sub(organism.position).normalize();
    organism.move(direction);
  }

  /**
   * Basic fleeing behavior.
   * Moves the organism away from a threat position.
   * @param {Organism} organism The organism fleeing.
   * @param {THREE.Vector3} threatPosition The position to flee from.
   */
  static flee(organism, threatPosition) {
    if (!threatPosition) return;
    const direction = organism.position.clone().sub(threatPosition).normalize(); // Direction away from threat
    organism.move(direction);
  }

  /**
   * Determines the next state based on the organism's needs and environment.
   * This is a placeholder and needs to be implemented specifically for each organism type.
   * @param {Organism} organism The organism.
   * @param {Ecosystem} ecosystem The ecosystem context.
   * @returns {string} The new AI state (from AI_STATE enum).
   */
  static decideNextState(organism, ecosystem) {
    // Basic decision tree (example)
    if (organism.isDead()) {
      return AI_STATE.DEAD;
    }

    // Priority 1: Flee from threats
    const threats = ecosystem.getOrganismsInRadius(organism.position, organism.fleeRadius || 5, ecosystem.carnivores); // Example: Herbivores flee carnivores
    if (threats.length > 0 && organism.canFlee && organism.canFlee()) { // Check if organism type can flee
      organism.aiData.threat = threats[0]; // Target the nearest threat for fleeing logic
      return AI_STATE.FLEEING;
    }

    // Priority 2: Eat if hungry
    if (organism.isHungry && organism.isHungry()) {
        // Check if already close enough to eat target
        if (organism.aiData.foodTarget && organism.position.distanceTo(organism.aiData.foodTarget.position) < organism.reach || 1) {
            return AI_STATE.EATING;
        }
        // Otherwise, seek food
        return AI_STATE.SEEKING_FOOD;
    }

    // Priority 3: Reproduce if ready
    if (organism.isReadyToReproduce && organism.isReadyToReproduce()) {
        // Check if already close to a mate
        if (organism.aiData.mateTarget && organism.position.distanceTo(organism.aiData.mateTarget.position) < organism.reach || 1) {
            return AI_STATE.REPRODUCING;
        }
        // Otherwise, seek mate
        return AI_STATE.SEEKING_MATE;
    }

    // Default: Wander
    return AI_STATE.WANDERING;
  }

  /**
   * Executes the behavior corresponding to the organism's current state.
   * @param {Organism} organism The organism.
   * @param {Ecosystem} ecosystem The ecosystem context.
   * @param {number} deltaTime Time since last update.
   */
  static executeStateAction(organism, ecosystem, deltaTime) {
    if (!organism.aiData) organism.aiData = {};

    switch (organism.state) {
      case AI_STATE.WANDERING:
        SimpleAI.wander(organism);
        break;

      case AI_STATE.SEEKING_FOOD:
        // Find food target if not already set or if target is invalid
        if (!organism.aiData.foodTarget || organism.aiData.foodTarget.isDead()) {
            organism.aiData.foodTarget = organism.findFood(ecosystem);
        }
        if (organism.aiData.foodTarget) {
            SimpleAI.seek(organism, organism.aiData.foodTarget.position);
        } else {
            // No food found, maybe wander instead?
            SimpleAI.wander(organism);
            organism.state = AI_STATE.WANDERING; // Change state if no food
        }
        break;

      case AI_STATE.EATING:
        if (organism.aiData.foodTarget && !organism.aiData.foodTarget.isDead()) {
            organism.eat(organism.aiData.foodTarget, deltaTime);
            // Check if still hungry, if not, change state
            if (!organism.isHungry()) {
                organism.aiData.foodTarget = null; // Clear target
                // Decide next state immediately or wait for next cycle?
            }
        } else {
            // Food target gone, decide next state
            organism.aiData.foodTarget = null;
            organism.state = SimpleAI.decideNextState(organism, ecosystem);
        }
        break;

      case AI_STATE.FLEEING:
        if (organism.aiData.threat && !organism.aiData.threat.isDead()) {
            SimpleAI.flee(organism, organism.aiData.threat.position);
            // Optionally, check if threat is still nearby
            if (organism.position.distanceTo(organism.aiData.threat.position) > (organism.fleeRadius || 5) * 1.5) {
                organism.aiData.threat = null; // Threat evaded
            }
        } else {
            // Threat gone or invalid, decide next state
            organism.aiData.threat = null;
            organism.state = SimpleAI.decideNextState(organism, ecosystem);
        }
        break;

      case AI_STATE.SEEKING_MATE:
         // Similar logic to seeking food
         if (!organism.aiData.mateTarget || organism.aiData.mateTarget.isDead()) {
            organism.aiData.mateTarget = organism.findMate(ecosystem);
         }
         if (organism.aiData.mateTarget) {
            SimpleAI.seek(organism, organism.aiData.mateTarget.position);
         } else {
            SimpleAI.wander(organism);
            organism.state = AI_STATE.WANDERING;
         }
         break;

      case AI_STATE.REPRODUCING:
         if (organism.aiData.mateTarget && !organism.aiData.mateTarget.isDead()) {
            organism.reproduce(organism.aiData.mateTarget, ecosystem);
            // Reset state after reproduction attempt
            organism.aiData.mateTarget = null;
            // organism.state = AI_STATE.IDLE; // Or WANDERING
         } else {
            organism.aiData.mateTarget = null;
            organism.state = SimpleAI.decideNextState(organism, ecosystem);
         }
         break;

      case AI_STATE.IDLE:
      default:
        // Do nothing or maybe wander slowly
        break;
    }
  }
}

// Make sure THREE is available if vector operations are needed directly here
// import * as THREE from 'three';
// If not, ensure organisms handle vector math internally.