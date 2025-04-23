import * as THREE from 'three';

class Organism {
    constructor(position = new THREE.Vector3(0, 0.5, 0), energy = 100, age = 0) {
        this.id = null; // Assigned by Ecosystem
        this.position = position;
        this.energy = energy;
        this.age = age;
        this.maxAge = 100; // Example max age
        this.state = 'idle'; // e.g., idle, wandering, eating, fleeing, reproducing
        this.size = 1; // Base size
        this.positionChanged = true; // Flag to notify SceneManager
        this.scaleChanged = true; // Flag to notify SceneManager
        this.type = 'organism'; // Base type
        this.perceptionRadius = 5; // How far it can 'see'
        this.fleeRadius = 8; // Distance at which it starts fleeing

        // Movement related
        this.velocity = new THREE.Vector3();
        this.maxSpeed = 1; // Units per second
        this.steeringForce = new THREE.Vector3();
        this.maxForce = 0.1; // Steering force limit
    }

    update(deltaTime, ecosystem) {
        this.age += deltaTime;
        this.energy -= deltaTime * 0.1; // Basic energy decay

        // Apply steering forces to velocity
        this.velocity.add(this.steeringForce.multiplyScalar(deltaTime));
        // Clamp velocity to maxSpeed
        if (this.velocity.lengthSq() > this.maxSpeed * this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }

        // Update position based on velocity
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.position.add(deltaPosition);

        // Reset steering force for next frame
        this.steeringForce.set(0, 0, 0);

        // Basic wandering behavior if idle
        if (this.state === 'idle') {
            this.wander(deltaTime);
        }

        // Keep organism on the ground (assuming ground is at y=0)
        if (this.position.y < this.size * 0.5) {
             this.position.y = this.size * 0.5;
             this.velocity.y = 0; // Stop vertical movement if hit ground
        }

        // Check if position actually changed significantly
        if (deltaPosition.lengthSq() > 0.0001) { // Threshold to avoid unnecessary updates
            this.positionChanged = true;
        }

        // Check for death conditions
        if (this.energy <= 0 || this.age > this.maxAge) {
            this.die();
        }
    }

    applyForce(force) {
        this.steeringForce.add(force);
    }

    wander(deltaTime) {
        // Simple random direction change
        if (Math.random() < 0.05) { // Change direction occasionally
            const angle = Math.random() * Math.PI * 2;
            const desiredVelocity = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(this.maxSpeed * 0.5); // Wander at half speed
            const steer = desiredVelocity.sub(this.velocity);
            steer.clampLength(0, this.maxForce); // Limit steering force
            this.applyForce(steer);
        }
        // Add a small forward push to keep moving
        const forwardPush = this.velocity.clone().normalize().multiplyScalar(this.maxForce * 0.1);
        this.applyForce(forwardPush);
    }

    seek(targetPosition) {
        const desiredVelocity = targetPosition.clone().sub(this.position).normalize().multiplyScalar(this.maxSpeed);
        const steer = desiredVelocity.sub(this.velocity);
        steer.clampLength(0, this.maxForce);
        this.applyForce(steer);
        this.state = 'seeking'; // Example state change
    }

    flee(targetPosition) {
        const desiredVelocity = this.position.clone().sub(targetPosition).normalize().multiplyScalar(this.maxSpeed);
        const steer = desiredVelocity.sub(this.velocity);
        steer.clampLength(0, this.maxForce);
        this.applyForce(steer);
        this.state = 'fleeing';
    }

    eat(target, deltaTime) {
        // Implemented in subclasses
        console.warn('Base eat method called - should be overridden');
    }

    reproduce(partner, ecosystem) {
        // Implemented in subclasses
        console.warn('Base reproduce method called - should be overridden');
    }

    isDead() {
        return this.energy <= 0 || this.age > this.maxAge;
    }

    die() {
        this.state = 'dead';
        this.energy = 0;
        // Ecosystem will handle removal
        console.log(`Organism ${this.id} died.`);
    }

    isHungry() {
        // Example condition, override in subclasses
        return this.energy < 50;
    }
}

export default Organism;