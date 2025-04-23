class Environment {
    constructor() {
        this.temperature = 25; // degrees Celsius
        this.rainfall = 50; // mm per unit time (e.g., per day)
        this.lightLevel = 1.0; // 0 (dark) to 1 (bright)
        this.pollution = 0.0; // 0 (clean) to 1 (highly polluted)
        this.timeOfDay = 0.5; // 0 to 1 (e.g., 0 = midnight, 0.5 = noon)
        this.dayDuration = 60; // seconds for a full day-night cycle
    }

    update(deltaTime) {
        // Update time of day
        this.timeOfDay = (this.timeOfDay + deltaTime / this.dayDuration) % 1;

        // Update light level based on time of day (simple sine wave)
        this.lightLevel = Math.max(0.1, Math.sin(this.timeOfDay * Math.PI)); // Ensure minimum light

        // Add more complex logic: seasonal changes, random weather events etc.
        // Example: Random temperature fluctuation
        this.temperature += (Math.random() - 0.5) * 0.1 * deltaTime;
    }

    triggerRandomEvents(ecosystem, deltaTime) {
        // Example: Small chance of drought
        if (Math.random() < 0.001 * deltaTime) {
            console.warn('Drought started!');
            this.rainfall *= 0.1;
            // Set a timer to end the drought
            setTimeout(() => {
                console.warn('Drought ended.');
                this.rainfall /= 0.1; // Restore rainfall
            }, 10000 * Math.random()); // Drought lasts 0-10 seconds
        }
        // Add more events: floods, disease, pollution spikes etc.
    }

    getLightLevel() {
        return this.lightLevel;
    }

    getTemperature() {
        return this.temperature;
    }

    getRainfall() {
        return this.rainfall;
    }

    getPollution() {
        return this.pollution;
    }

    // Method to get all relevant state for UI or other systems
    getState() {
        return {
            temperature: this.temperature,
            rainfall: this.rainfall,
            lightLevel: this.lightLevel,
            pollution: this.pollution,
            timeOfDay: this.timeOfDay,
        };
    }

    // Methods to allow external modification (e.g., from UI controls)
    setTemperature(value) {
        this.temperature = value;
    }

    setRainfall(value) {
        this.rainfall = value;
    }

    setPollution(value) {
        this.pollution = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
    }
}

export default Environment;