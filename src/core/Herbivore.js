import Organism from './Organism';
import * as THREE from 'three';
import { Plant } from './Plant'; // Need to know about Plants to eat them

export class Herbivore extends Organism {
    constructor(position = new THREE.Vector3(Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20), energy = 150) {
        super(position, energy);
        this.type = 'herbivore';
        this.size = 1.2;
        this.maxSpeed = 1.5 + Math.random() * 0.5; // Slightly faster than base
        this.energy = 150;
        this.maxEnergy = 250;
        this.hungerThreshold = 100;
        this.eatAmount = 50; // Energy gained per bite
        this.eatCooldown = 1; // Seconds between bites
        this.lastEatTime = -this.eatCooldown; // Allow eating immediately
        this.perceptionRadius = 10;
        this.fleeRadius = 12;
        this.reproductionThreshold = 200;
        this.reproductionCooldown = 15; // Seconds
        this.lastReproduceTime = -this.reproductionCooldown;
        this.scaleChanged = true;
    }

    update(deltaTime, ecosystem) {
        super.update(deltaTime, ecosystem); // Handle basic movement, aging, energy decay

        if (this.isDead()) return;

        const nearbyCarnivore = ecosystem.findNearestOrganism(this, ecosystem.carnivores, this.fleeRadius);
        if (nearbyCarnivore) {
            this.flee(nearbyCarnivore.position);
        } else if (this.isHungry()) {
            this.state = 'seeking_food';
            const nearbyPlant = ecosystem.findNearestOrganism(this, ecosystem.plants, this.perceptionRadius);
            if (nearbyPlant) {
                const distanceToPlant = this.position.distanceTo(nearbyPlant.position);
                if (distanceToPlant < this.size * 0.5 + nearbyPlant.size * 0.5 + 0.2) { // Close enough to eat
                    this.eat(nearbyPlant, deltaTime, ecosystem.time);
                } else {
                    this.seek(nearbyPlant.position);
                }
            } else {
                this.wander(deltaTime); // Wander if no food found
            }
        } else if (this.canReproduce(ecosystem.time)) {
             this.state = 'seeking_mate';
             const nearbyMate = ecosystem.findNearestOrganism(this, ecosystem.herbivores.filter(h => h !== this && h.canReproduce(ecosystem.time)), this.perceptionRadius);
             if (nearbyMate) {
                 const distanceToMate = this.position.distanceTo(nearbyMate.position);
                 if (distanceToMate < this.size + nearbyMate.size) { // Close enough to reproduce
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

    eat(plant, deltaTime, currentTime) {
        if (currentTime - this.lastEatTime >= this.eatCooldown) {
            this.state = 'eating';
            const energyToGain = Math.min(this.eatAmount, plant.energy * 0.8, this.maxEnergy - this.energy);
            plant.energy -= energyToGain * 1.2; // Eating reduces plant energy
            this.energy += energyToGain;
            this.lastEatTime = currentTime;
            console.log(`Herbivore ${this.id} ate Plant ${plant.id}. Gained ${energyToGain.toFixed(2)} energy.`);

            if (plant.energy <= 0) {
                plant.die(); // Plant might die after being eaten
            }
            // Stop moving while eating briefly
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
        partner.state = 'reproducing'; // Partner also enters reproducing state briefly

        const energyCost = 80;
        this.energy -= energyCost;
        partner.energy -= energyCost;
        this.lastReproduceTime = currentTime;
        partner.lastReproduceTime = currentTime; // Reset cooldown for both

        const offspringPosition = this.position.clone().lerp(partner.position, 0.5);
        offspringPosition.y = 0.5; // Ensure it starts on the ground
        const offspring = new Herbivore(offspringPosition, energyCost * 0.8); // Give offspring some starting energy

        ecosystem.addOrganism(offspring);
        console.log(`Herbivores ${this.id} and ${partner.id} reproduced. New herbivore ${offspring.id}`);

        // Briefly pause after reproducing
        this.velocity.multiplyScalar(0.1);
        partner.velocity.multiplyScalar(0.1);
        // Reset state after a short delay (or let the next update cycle handle it)
        setTimeout(() => { 
            if(this.state === 'reproducing') this.state = 'idle'; 
            if(partner.state === 'reproducing') partner.state = 'idle'; 
        }, 500); 
    }
}