import rpio from "@remarkablearts/rpio";
import { PINS } from "../services/sensors/constants.js";
import { getTemperatureValue } from "./sensors/temperature.js";
import { getAlcoholValue } from "./sensors/alcohol.js";
import { getPulseValue } from "./sensors/pulse.js";

const PINS = {
	ALCOHOL_POWER: 23,
	ALCOHOL_SOBER: 27,
	ALCOHOL_DRUNK: 22,
	ALCOHOL_READY: 17,
	ALCOHOL_TOGGLE: 14,
};

export class GPIOService {
	static init() {
		try {
			rpio.init({ gpiomem: false, mock: "raspi-3" });
			[
				PINS.ALCOHOL_POWER,
				PINS.ALCOHOL_SOBER,
				PINS.ALCOHOL_DRUNK,
				PINS.ALCOHOL_READY,
				PINS.ALCOHOL_TOGGLE,
			].forEach((pin) => {
				rpio.open(pin, rpio.OUTPUT);
			});
		} catch (error) {
			console.error("GPIO initialization failed:", error);
			process.exit(1);
		}
	}

	static writePin(pin, value) {
		rpio.write(pin, value > 128 ? rpio.HIGH : rpio.LOW);
	}

	static async getHeartbeat() {
		const pulseData = await getPulseValue();
		console.log("Pulse Data:", pulseData);
		return pulseData;
	}

	static async getTemperature() {
		const temperatureData = await getTemperatureValue();
		console.log("Temperature Data:", temperatureData);
		return temperatureData;
	}

	static async getAlcohol() {
		const alcoholData = await getAlcoholValue();
		console.log("Alcohol Level Data:", alcoholData);
		return alcoholData;
	}
}
