import pkg from "node-libgpiod";
import { PINS } from "./constants.js";

const { Chip, Line } = pkg;

// Store instances globally to prevent garbage collection
global.chip = new Chip(0);
global.lines = {
	ALCOHOL_READY: new Line(global.chip, PINS.ALCOHOL_READY),
	ALCOHOL_SOBER: new Line(global.chip, PINS.ALCOHOL_SOBER),
	ALCOHOL_DRUNK: new Line(global.chip, PINS.ALCOHOL_DRUNK),
	ALCOHOL_POWER: new Line(global.chip, PINS.ALCOHOL_POWER),
	ALCOHOL_TOGGLE: new Line(global.chip, PINS.ALCOHOL_TOGGLE),
};

try {
	// Configure input pins
	[
		global.lines.ALCOHOL_READY,
		global.lines.ALCOHOL_SOBER,
		global.lines.ALCOHOL_DRUNK,
		global.lines.ALCOHOL_POWER,
	].forEach((line) => {
		line.requestInputMode({ bias: "pull-up" });
	});

	// Configure output pin
	global.lines.ALCOHOL_TOGGLE.requestOutputMode();
	console.log("GPIO lines initialized successfully");
} catch (error) {
	console.error("Failed to initialize GPIO lines:", error);
	process.exit(1);
}

// Cleanup handler
process.on("exit", () => {
	Object.values(global.lines).forEach((line) => {
		try {
			line.release();
		} catch (error) {
			console.error("Error releasing line:", error);
		}
	});
});

// Keep references in function scope
export function getAlcoholSensorStatus() {
	try {
		const line = global.lines.ALCOHOL_POWER;
		return line.getValue() === 0 ? "off" : "on";
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

		const soberLine = global.lines.ALCOHOL_SOBER;
		const drunkLine = global.lines.ALCOHOL_DRUNK;
		let soberPrev = soberLine.getValue();
		let drunkPrev = drunkLine.getValue();

		const timeout = 5000;
		const start = Date.now();
		while (Date.now() - start < timeout) {
			const soberCurrent = soberLine.getValue();
			const drunkCurrent = drunkLine.getValue();

			if (soberCurrent === 0 && soberPrev === 1) {
				return "normal";
			}
			if (drunkCurrent === 0 && drunkPrev === 1) {
				return "abnormal";
			}

			soberPrev = soberCurrent;
			drunkPrev = drunkCurrent;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		return null;
	} catch (error) {
		console.error("Error reading alcohol value:", error);
		throw error;
	}
}

export function isAlcoholSensorReadyToUse() {
	try {
		const line = global.lines.ALCOHOL_READY;
		const ready = line.getValue();
		console.log("Alcohol sensor ready state:", ready);
		return ready === 1;
	} catch (error) {
		console.error("Error checking sensor readiness:", error);
		return false;
	}
}

export function toggleAlcoholSensor() {
	try {
		const line = global.lines.ALCOHOL_TOGGLE;
		line.setValue(1);
		setTimeout(() => line.setValue(0), 500);
		return true;
	} catch (error) {
		console.error("Error toggling sensor:", error);
		return false;
	}
}
