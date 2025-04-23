import Organism from './Organism';
import * as THREE from 'three';
import { Herbivore } from './Herbivore'; // Need to know about Herbivores to hunt them

export class Carnivore extends Organism {
    constructor(position = new THREE.Vector3(Math.random() * 30 - 15, 0.7, Math.random() * 30 - 15), energy = 200) {
        super(position, energy);
        this.type = 'carnivore';
        this.size = 1.5;
        this.maxSpeed = 2.0 + Math.random() * 0.8; // Faster than herbivores
        this.energy = 200;
        this.maxEnergy = 400;
        this.hungerThreshold = 150;
        this.huntAmount = 100; // Energy gained per successful hunt
        this.huntCooldown = 5; // Seconds between hunts
        this.lastHuntTime = -this.huntCooldown;
        this.perceptionRadius = 15;
        // Carnivores don't typically flee in this simple model
        this.reproductionThreshold = 300;
        this.reproductionCooldown = 25; // Seconds
        this.lastReproduceTime = -this.reproductionCooldown;
        this.scaleChanged = true;
        this.position.y = this.size * 0.5; // Ensure correct starting height
    }

    update(deltaTime, ecosystem) {
        super.update(deltaTime, ecosystem); // Handle basic movement, aging, energy decay

        if (this.isDead()) return;

        if (this.isHungry()) {
            this.state = 'seeking_prey';
            const nearbyHerbivore = ecosystem.findNearestOrganism(this, ecosystem.herbivores, this.perceptionRadius);
            if (nearbyHerbivore) {
                const distanceToPrey = this.position.distanceTo(nearbyHerbivore.position);
                // Check if close enough to 'catch' (attack)
                if (distanceToPrey < this.size * 0.5 + nearbyHerbivore.size * 0.5 + 0.3) {
                    this.hunt(nearbyHerbivore, deltaTime, ecosystem.time);
                } else {
                    this.seek(nearbyHerbivore.position);
                }
            } else {
                this.wander(deltaTime); // Wander if no prey found
            }
        } else if (this.canReproduce(ecosystem.time)) {
             this.state = 'seeking_mate';
             const nearbyMate = ecosystem.findNearestOrganism(this, ecosystem.carnivores.filter(c => c !== this && c.canReproduce(ecosystem.time)), this.perceptionRadius);
             if (nearbyMate) {
                 const distanceToMate = this.position.distanceTo(nearbyMate.position);
                 if (distanceToMate < this.size + nearbyMate.size) { // Close enough
                     this.reproduce(nearbyMate, ecosystem, ecosystem.time);
                 } else {
                     this.seek(nearbyMate.position);
                 }
             } else {
                 this.wander(deltaTime);
             }
        } else {
            this.state = 'wandering';
            this.wander(deltaTime);
        }
    }

    hunt(herbivore, deltaTime, currentTime) {
        if (currentTime - this.lastHuntTime >= this.huntCooldown && !herbivore.isDead()) {
            this.state = 'hunting';
            const energyToGain = Math.min(this.huntAmount, herbivore.energy, this.maxEnergy - this.energy);
            herbivore.energy -= energyToGain * 1.5; // Hunting damages the herbivore significantly
            this.energy += energyToGain;
            this.lastHuntTime = currentTime;
            console.log(`Carnivore ${this.id} hunted Herbivore ${herbivore.id}. Gained ${energyToGain.toFixed(2)} energy.`);

            if (herbivore.energy <= 0) {
                herbivore.die(); // Herbivore dies from the hunt
                console.log(`Herbivore ${herbivore.id} was killed by Carnivore ${this.id}.`);
            }
            // Stop moving briefly after a hunt
            this.velocity.multiplyScalar(0.1);
        }
    }

    isHungry() {
        return this.energy < this.hungerThreshold;
    }

    canReproduce(currentTime) {
        return this.energy > this.reproductionThreshold && (currentTime - this.lastReproduceTime) >= this.reproductionCooldown;
    }

    reproduce(partner, ecosystem, currentTime) {
        if (!this.canReproduce(currentTime) || !partner || !partner.canReproduce(currentTime)) {
            return; // Conditions not met
        }

        this.state = 'reproducing';
        partner.state = 'reproducing';

        const energyCost = 120;
        this.energy -= energyCost;
        partner.energy -= energyCost;
        this.lastReproduceTime = currentTime;
        partner.lastReproduceTime = currentTime;

        const offspringPosition = this.position.clone().lerp(partner.position, 0.5);
        offspringPosition.y = 0.7; // Ensure correct starting height
        const offspring = new Carnivore(offspringPosition, energyCost * 0.8);

        ecosystem.addOrganism(offspring);
        console.log(`Carnivores ${this.id} and ${partner.id} reproduced. New carnivore ${offspring.id}`);

        this.velocity.multiplyScalar(0.1);
        partner.velocity.multiplyScalar(0.1);
        setTimeout(() => { 
            if(this.state === 'reproducing') this.state = 'idle'; 
            if(partner.state === 'reproducing') partner.state = 'idle'; 
        }, 500); 
    }

    // Carnivores don't get eaten in this simple model
    eat(target, deltaTime) {}

    // Carnivores don't flee in this simple model
    flee(targetPosition) {}
}