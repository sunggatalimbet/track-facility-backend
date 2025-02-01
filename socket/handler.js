import {
	getTemperatureValue,
	getAlcoholSensorStatus,
	getAlcoholValue,
	isAlcoholSensorReadyToUse,
	toggleAlcoholSensor,
	getPulseValue,
} from "../services/simulation.js";
// import { GPIOService } from "../services/gpio.js";
// import { GPIO_PINS } from "../services/sensors/constants.js";

export class SocketHandler {
	static handleConnection(socket) {
		console.log(`Client connected: ${socket.id}`);
		const intervals = [];

		try {
			intervals.push(
				setInterval(async () => {
					try {
						const data = await getPulseValue();
						const mappedValue = Math.floor(
							(parseFloat(data.bpm) - 60) * (255 / 60),
						);
						// GPIOService.writePin(GPIO_PINS.HEARTBEAT, mappedValue);
						socket.emit("heartbeat", {
							timestamp: Date.now(),
							bpm: data.bpm,
						});
					} catch (error) {
						console.error("Heartbeat error:", error);
					}
				}, 500),
			);

			intervals.push(
				setInterval(async () => {
					try {
						const data = await getTemperatureValue();
						const mappedValue = Math.floor(
							(data.objectTemperature - 36) * (255 / 2),
						);
						// GPIOService.writePin(
						// 	GPIO_PINS.TEMPERATURE,
						// 	mappedValue,
						// );
						socket.emit("temperature", {
							timestamp: Date.now(),
							temperature: data.objectTemperature.toFixed(1),
						});
					} catch (error) {
						console.error("Temperature error:", error);
					}
				}, 500),
			);

			intervals.push(
				setInterval(async () => {
					try {
						const sensorStatus = getAlcoholSensorStatus();
						const sensorReady = isAlcoholSensorReadyToUse();

						if (sensorStatus === "off" || !sensorReady) {
							toggleAlcoholSensor();
						}

						const alcoholLevel = await getAlcoholValue();
						const mappedValue = alcoholLevel === "normal" ? 0 : 255;
						// GPIOService.writePin(GPIO_PINS.ALCOHOL, mappedValue);

						socket.emit("alcohol", {
							timestamp: Date.now(),
							alcoholLevel: alcoholLevel,
							sensorStatus: sensorStatus,
							sensorReady: sensorReady,
						});
					} catch (error) {
						console.error("Alcohol sensor error:", error);
					}
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
