import { getTemperatureValue } from "../services/sensors/temperature.js";
// import {
// 	getAlcoholValue,
// 	toggleAlcoholSensor,
// 	getAlcoholSensorStatus,
// 	isAlcoholSensorReadyToUse,
// } from "../services/sensors/alcohol.js";
import {
	getAlcoholSensorStatus,
	isAlcoholSensorReadyToUse,
	toggleAlcoholSensor,
	getAlcoholValue,
} from "../services/sensors/alcohol-bridge.js";
import { getPulseValue } from "../services/sensors/pulse.js";
import { simulationService } from "../services/simulation.js";

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

export class SocketHandler {
	static handleConnection(socket) {
		console.log(`Client connected: ${socket.id}`);
		const intervals = [];
		let cameraInterval;

		try {
			intervals.push(
				setInterval(async () => {
					try {
						const data = await getPulseValue();

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

						socket.emit("temperature", {
							timestamp: Date.now(),
							temperature: data.ambientTemperature,
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
							console.log("Toggling sensor due to status:", {
								sensorStatus,
								sensorReady,
							});
							toggleAlcoholSensor();
						}

						const alcoholLevel = await getAlcoholValue();

						socket.emit("alcohol", {
							timestamp: Date.now(),
							alcoholLevel: alcoholLevel,
							sensorStatus: sensorStatus,
							sensorReady: sensorReady,
							pinStates: {
								ready: currentState.ready,
								sober: currentState.sober,
								drunk: currentState.drunk,
								power: currentState.power,
							},
						});
					} catch (error) {
						console.error("Alcohol sensor error:", error);
					}
				}, 500),
			);

			socket.on("start-camera", async () => {
				try {
					cameraInterval = setInterval(async () => {
						try {
							const tempFile = `/tmp/capture_${Date.now()}.jpg`;
							await execAsync(
								`libcamera-still -n -o ${tempFile} --immediate -t 1`,
							);

							const image = await fs.readFile(tempFile);
							const base64 = image.toString("base64");
							await fs.unlink(tempFile);

							socket.emit("camera-frame", {
								success: true,
								image: `data:image/jpeg;base64,${base64}`,
							});
						} catch (err) {
							console.error("Error capturing frame:", err);
							socket.emit(
								"camera-error",
								"Failed to capture frame",
							);
						}
					}, 1000); // Send frames every 1000ms for smoother video
				} catch (err) {
					console.error("Error starting camera:", err);
					socket.emit("camera-error", "Failed to start camera");
				}
			});

			socket.on("stop-camera", () => {
				if (cameraInterval) {
					clearInterval(cameraInterval);
				}
			});
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
			if (cameraInterval) {
				clearInterval(cameraInterval);
			}
		});
	}
}
