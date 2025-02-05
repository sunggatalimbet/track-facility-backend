// import { Gpio } from "onoff";
// import { getTemperatureValue } from "./sensors/temperature.js";
// import { getAlcoholValue } from "./sensors/alcohol.js";
// import { getPulseValue } from "./sensors/pulse.js";

// const PINS = {
// 	ALCOHOL_POWER: 23,
// 	ALCOHOL_SOBER: 27,
// 	ALCOHOL_DRUNK: 22,
// 	ALCOHOL_READY: 17,
// 	ALCOHOL_TOGGLE: 14,
// };

// export class GPIOService {
// 	static gpios = {};

// 	static init() {
// 		try {
// 			// Initialize output pins
// 			[PINS.HEARTBEAT, PINS.TEMPERATURE, PINS.ALCOHOL].forEach((pin) => {
// 				this.gpios[pin] = new Gpio(pin, "out");
// 			});
// 		} catch (error) {
// 			console.error("GPIO initialization failed:", error);
// 			process.exit(1);
// 		}

// 		// Cleanup GPIO on process exit
// 		process.on("SIGINT", () => {
// 			Object.values(this.gpios).forEach((gpio) => gpio.unexport());
// 		});
// 	}

// 	static writePin(pin, value) {
// 		this.gpios[pin].writeSync(value > 128 ? 1 : 0);
// 	}

// 	static async getHeartbeat() {
// 		const pulseData = await getPulseValue();
// 		console.log("Pulse Data:", pulseData);
// 		return pulseData;
// 	}

// 	static async getTemperature() {
// 		const temperatureData = await getTemperatureValue();
// 		console.log("Temperature Data:", temperatureData);
// 		return temperatureData;
// 	}

// 	static async getAlcohol() {
// 		const alcoholData = await getAlcoholValue();
// 		console.log("Alcohol Level Data:", alcoholData);
// 		return alcoholData;
// 	}
// }
