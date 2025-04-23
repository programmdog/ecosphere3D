import Organism from './Organism';
import * as THREE from 'three';

export class Plant extends Organism {
    constructor(position = new THREE.Vector3(Math.random() * 50 - 25, 0.5, Math.random() * 50 - 25), energy = 50) {
        super(position, energy);
        this.type = 'plant';
        this.growthRate = 0.5; // Energy gained per second from sunlight
        this.maxSize = 2;
        this.size = 0.5 + Math.random() * 0.5; // Initial size
        this.maxAge = 50 + Math.random() * 50; // Plants live longer
        this.energy = this.size * 20; // Initial energy based on size
        this.scaleChanged = true;
        this.velocity = new THREE.Vector3(); // Plants don't move
        this.maxSpeed = 0;
    }

    update(deltaTime, ecosystem) {
        // Plants don't call super.update() for movement
        this.age += deltaTime;

        // Photosynthesis - gain energy from environment light
        const lightFactor = ecosystem.environment.getLightLevel(); // Assume Environment has this method
        this.energy += this.growthRate * lightFactor * deltaTime;

        // Grow based on energy
        const potentialGrowth = this.energy * 0.01 * deltaTime;
        if (this.size < this.maxSize && potentialGrowth > 0) {
            const actualGrowth = Math.min(potentialGrowth, this.maxSize - this.size);
            this.size += actualGrowth;
            this.energy -= actualGrowth * 10; // Cost of growing
            this.position.y = this.size * 0.5; // Adjust height based on size
            this.scaleChanged = true;
            this.positionChanged = true; // Position changes due to Y adjustment
        }

        // Energy consumption (basic metabolism)
        this.energy -= this.size * 0.05 * deltaTime;

        // Reproduction (simple splitting/seeding when large and energetic enough)
        if (this.energy > 80 && this.size > this.maxSize * 0.8 && Math.random() < 0.01 * deltaTime) {
            this.reproduce(null, ecosystem);
        }

        // Check for death
        if (this.energy <= 0 || this.age > this.maxAge) {
            this.die();
        }
    }

    reproduce(partner, ecosystem) {
        this.energy *= 0.5; // Cost of reproduction
        const offspringPosition = this.position.clone().add(new THREE.Vector3(Math.random() * 4 - 2, 0, Math.random() * 4 - 2));
        // Keep offspring on ground
        offspringPosition.y = 0.5; // Initial height for new plant
        // Ensure offspring is within reasonable bounds (example: -50 to 50)
        offspringPosition.x = Math.max(-49, Math.min(49, offspringPosition.x));
        offspringPosition.z = Math.max(-49, Math.min(49, offspringPosition.z));

        const offspring = new Plant(offspringPosition, this.energy * 0.4); // Pass some energy
        ecosystem.addOrganism(offspring);
        console.log(`Plant ${this.id} reproduced. New plant ${offspring.id}`);
    }

    // Plants don't eat in the traditional sense
    eat(target, deltaTime) {}

    // Plants don't flee
    flee(targetPosition) {}

    // Plants don't wander
    wander(deltaTime) {}
}