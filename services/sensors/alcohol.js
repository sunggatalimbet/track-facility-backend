import rpio from "@remarkablearts/rpio";
import { PINS } from "./constants.js";
rpio.init({ mapping: "gpio", mock: "raspi-3" });

export function getAlcoholSensorStatus() {
	try {
		const status = rpio.read(PINS.ALCOHOL_POWER);
		rpio.close(PINS.ALCOHOL_POWER);
		return status === rpio.LOW ? "off" : "on";
	} catch (error) {
		console.error("Error reading alcohol sensor status:", error);
		return "off";
	}
}

export async function getAlcoholValue() {
	try {
		if (!isAlcoholSensorReadyToUse()) {
			console.log("Sensor not ready");
			return null;
		}

		let soberPrev = rpio.read(PINS.ALCOHOL_SOBER);
		let drunkPrev = rpio.read(PINS.ALCOHOL_DRUNK);

		const timeout = 5000;
		const start = Date.now();
		while (Date.now() - start < timeout) {
			const soberCurrent = rpio.read(PINS.ALCOHOL_SOBER);
			const drunkCurrent = rpio.read(PINS.ALCOHOL_DRUNK);

			if (soberCurrent === rpio.LOW && soberPrev === rpio.HIGH) {
				return "normal";
			}
			if (drunkCurrent === rpio.LOW && drunkPrev === rpio.HIGH) {
				return "abnormal";
			}

			soberPrev = soberCurrent;
			drunkPrev = drunkCurrent;
			rpio.msleep(10);
		}

		return null;
	} catch (error) {
		console.error("Error reading alcohol value:", error);
		throw error;
	} finally {
		rpio.close(PINS.ALCOHOL_SOBER);
		rpio.close(PINS.ALCOHOL_DRUNK);
	}
}

export function isAlcoholSensorReadyToUse() {
	try {
		const isReady = rpio.read(PINS.ALCOHOL_READY) === rpio.HIGH;
		return isReady;
	} catch (error) {
		console.error("Error checking if alcohol sensor is ready:", error);
		return false;
	}
}

export function toggleAlcoholSensor() {
	try {
		rpio.write(PINS.ALCOHOL_TOGGLE, rpio.HIGH);
		rpio.sleep(0.5);
		rpio.write(PINS.ALCOHOL_TOGGLE, rpio.LOW);
		rpio.close(PINS.ALCOHOL_TOGGLE);
		return true;
	} catch (error) {
		console.error("Error toggling alcohol sensor:", error);
		return false;
	}
}
