import { SimulationService } from "../services/simulation.js";
import { GPIOService } from "../services/gpio.js";
import { GPIO_PINS } from "../services/sensors/constants.js";

export class SocketHandler {
	static handleConnection(socket) {
		console.log(`Client connected: ${socket.id}`);
		const intervals = [];

		try {
			intervals.push(
				setInterval(() => {
					const data = SimulationService.simulateHeartbeat();
					const mappedValue = Math.floor(
						(data.bpm - 60) * (255 / 60),
					);
					GPIOService.writePin(GPIO_PINS.HEARTBEAT, mappedValue);
					socket.emit("heartbeat", data);
				}, 500),
			);

			intervals.push(
				setInterval(() => {
					const data = SimulationService.simulateTemperature();
					const mappedValue = Math.floor(
						(data.temperature - 36) * (255 / 2),
					);
					GPIOService.writePin(GPIO_PINS.TEMPERATURE, mappedValue);
					socket.emit("temperature", data);
				}, 500),
			);

			intervals.push(
				setInterval(() => {
					const data = SimulationService.simulateAlcohol();
					const mappedValue = Math.floor(data.alcoholLevel * 2550);
					GPIOService.writePin(GPIO_PINS.ALCOHOL, mappedValue);
					socket.emit("alcohol", data);
				}, 500),
			);
		} catch (error) {
			console.error("Error in socket communication:", error);
			socket.emit("error", "Internal server error");
		}

		socket.on("error", (error) => {
			console.error("Socket error:", error);
		});

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
			intervals.forEach((interval) => clearInterval(interval));
		});
	}
}
