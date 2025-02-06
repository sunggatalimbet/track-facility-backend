import pkg from "node-libgpiod";
import { PINS } from "./constants.js";

const { Chip, Line } = pkg;
// Typically gpiochip0 controls the main GPIO pins (header pins)
const chip = new Chip(0);

// Create line instances for all pins
const lines = {
	ALCOHOL_READY: new Line(chip, PINS.ALCOHOL_READY),
	ALCOHOL_SOBER: new Line(chip, PINS.ALCOHOL_SOBER),
	ALCOHOL_DRUNK: new Line(chip, PINS.ALCOHOL_DRUNK),
	ALCOHOL_POWER: new Line(chip, PINS.ALCOHOL_POWER),
	ALCOHOL_TOGGLE: new Line(chip, PINS.ALCOHOL_TOGGLE),
};

try {
	[
		lines.ALCOHOL_READY,
		lines.ALCOHOL_SOBER,
		lines.ALCOHOL_DRUNK,
		lines.ALCOHOL_POWER,
	].forEach((line) => {
		line.requestInputMode({ bias: "pull-up" });
	});

	lines.ALCOHOL_TOGGLE.requestOutputMode();
	console.log("GPIO lines initialized successfully");
} catch (error) {
	console.error("Failed to initialize GPIO lines:", error);
	process.exit(1);
}

process.on("exit", () => {
	Object.values(lines).forEach((line) => line.release());
});

export function getAlcoholSensorStatus() {
	try {
		return lines.ALCOHOL_POWER.getValue() === 0 ? "off" : "on";
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

		let soberPrev = lines.ALCOHOL_SOBER.getValue();
		let drunkPrev = lines.ALCOHOL_DRUNK.getValue();

		const timeout = 10000;
		const start = Date.now();
		while (Date.now() - start < timeout) {
			const soberCurrent = lines.ALCOHOL_SOBER.getValue();
			const drunkCurrent = lines.ALCOHOL_DRUNK.getValue();

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
		const ready = lines.ALCOHOL_READY.getValue();
		console.log("Alcohol sensor ready state:", ready);
		return ready === 1;
	} catch (error) {
		console.error("Error checking sensor readiness:", error);
		return false;
	}
}

export function toggleAlcoholSensor() {
	try {
		lines.ALCOHOL_TOGGLE.setValue(1);
		setTimeout(() => lines.ALCOHOL_TOGGLE.setValue(0), 500);
		return true;
	} catch (error) {
		console.error("Error toggling sensor:", error);
		return false;
	}
}

// Add simulation support for non-RPi environments
if (!isRaspberryPi()) {
	console.warn("Running in simulation mode");
	setInterval(() => {
		lines.ALCOHOL_READY.setValue(Math.random() > 0.5 ? 1 : 0);
		lines.ALCOHOL_SOBER.setValue(Math.random() > 0.5 ? 1 : 0);
		lines.ALCOHOL_DRUNK.setValue(Math.random() > 0.5 ? 1 : 0);
		lines.ALCOHOL_POWER.setValue(Math.random() > 0.5 ? 1 : 0);
	}, 1000);
}

function isRaspberryPi() {
	try {
		const cpuInfo = require("fs").readFileSync("/proc/cpuinfo", "utf8");
		return cpuInfo.includes("Raspberry Pi");
	} catch {
		return false;
	}
}
