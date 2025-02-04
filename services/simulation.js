export class SimulationService {
	simulateHeartbeat() {
		return {
			timestamp: Date.now(),
			bpm: Math.floor(Math.random() * (120 - 60) + 60),
		};
	}

	simulateTemperature() {
		return {
			timestamp: Date.now(),
			temperature: (Math.random() * (38 - 36) + 36).toFixed(1),
		};
	}

	simulateAlcohol() {
		return {
			timestamp: Date.now(),
			alcoholLevel: (Math.random() * 0.1).toFixed(3),
		};
	}
}

export const simulationService = new SimulationService();
