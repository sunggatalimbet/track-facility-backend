import rpio from "@remarkablearts/rpio";
import { GPIO_PINS } from "./constants.js";

export function getAlcoholSensorStatus() {
	try {
		rpio.init({ mapping: "gpio" });
		rpio.open(GPIO_PINS.ALCOHOL_POWER, rpio.INPUT, rpio.PULL_UP);
		const status = rpio.read(GPIO_PINS.ALCOHOL_POWER);
		return status === rpio.LOW ? "off" : "on";
	} catch (error) {
		console.error("Error reading alcohol sensor status:", error);
		return "off";
	} finally {
		rpio.close(GPIO_PINS.ALCOHOL_POWER);
	}
}

export function isAlcoholSensorReadyToUse() {
	try {
		rpio.init({ mapping: "gpio" });
		rpio.open(GPIO_PINS.ALCOHOL_READY, rpio.INPUT, rpio.PULL_UP);
		const isReady = rpio.read(GPIO_PINS.ALCOHOL_READY) === rpio.HIGH;
		rpio.close(GPIO_PINS.ALCOHOL_READY);
		return isReady;
	} catch (error) {
		console.error("Error checking if alcohol sensor is ready:", error);
		return false;
	} finally {
		rpio.close(GPIO_PINS.ALCOHOL_READY);
	}
}

export function toggleAlcoholSensor() {
	try {
		rpio.init({ mapping: "gpio" });
		rpio.open(GPIO_PINS.ALCOHOL_TOGGLE, rpio.OUTPUT);
		rpio.write(GPIO_PINS.ALCOHOL_TOGGLE, rpio.HIGH);
		rpio.sleep(0.5);
		rpio.write(GPIO_PINS.ALCOHOL_TOGGLE, rpio.LOW);
		rpio.close(GPIO_PINS.ALCOHOL_TOGGLE);
		return true;
	} catch (error) {
		console.error("Error toggling alcohol sensor:", error);
		return false;
	}
}

export async function getAlcoholValue() {
	try {
		// Check current sensor status
		const currentStatus = getAlcoholSensorStatus();

		// If sensor is on, toggle it off and on again to ensure fresh reading
		if (currentStatus === "on") {
			toggleAlcoholSensor(); // Turn off
			await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
			toggleAlcoholSensor(); // Turn on
		} else {
			// If sensor is off, just turn it on
			toggleAlcoholSensor();
		}

		// Wait for sensor to be ready
		let attempts = 0;
		const maxAttempts = 10;
		while (!isAlcoholSensorReadyToUse() && attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			attempts++;
		}

		if (attempts >= maxAttempts) {
			throw new Error("Alcohol sensor failed to become ready");
		}

		// Now read the actual value
		rpio.init({ mapping: "gpio" });
		rpio.open(GPIO_PINS.ALCOHOL_SOBER, rpio.INPUT, rpio.PULL_UP);
		rpio.open(GPIO_PINS.ALCOHOL_DRUNK, rpio.INPUT, rpio.PULL_UP);

		const soberState = rpio.read(GPIO_PINS.ALCOHOL_SOBER);
		const drunkState = rpio.read(GPIO_PINS.ALCOHOL_DRUNK);

		rpio.close(GPIO_PINS.ALCOHOL_SOBER);
		rpio.close(GPIO_PINS.ALCOHOL_DRUNK);

		if (soberState === rpio.LOW) return "normal";
		if (drunkState === rpio.LOW) return "abnormal";
		return null;
	} catch (error) {
		console.error("Error reading alcohol value:", error);
		throw error;
	}
}
