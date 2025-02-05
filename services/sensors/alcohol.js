import { Gpio } from "onoff";

const PINS = {
	ALCOHOL_POWER: 23,
	ALCOHOL_SOBER: 27,
	ALCOHOL_DRUNK: 22,
	ALCOHOL_READY: 17,
	ALCOHOL_TOGGLE: 14,
};

const gpios = {};

Object.entries(PINS).forEach(([key, pin]) => {
	gpios[key] = new Gpio(pin, "in", "both", { activeLow: true });
});

export function getAlcoholSensorStatus() {
	try {
		const status = gpios.ALCOHOL_POWER.readSync();
		return status === 0 ? "off" : "on";
	} catch (error) {
		console.error("Error reading alcohol sensor status:", error);
		return "off";
	}
}

export async function getAlcoholValue() {
	try {
		console.debug("Starting alcohol measurement", {
			pins: [PINS.ALCOHOL_SOBER, PINS.ALCOHOL_DRUNK],
			timeout: 5000,
		});

		if (!isAlcoholSensorReadyToUse()) {
			console.log("Sensor not ready");
			return null;
		}

		let soberPrev = gpios.ALCOHOL_SOBER.readSync();
		let drunkPrev = gpios.ALCOHOL_DRUNK.readSync();

		const timeout = 10000;
		const start = Date.now();

		console.debug("Initial pin states", {
			soberPin: PINS.ALCOHOL_SOBER,
			soberState: soberPrev,
			drunkPin: PINS.ALCOHOL_DRUNK,
			drunkState: drunkPrev,
		});

		while (Date.now() - start < timeout) {
			const soberCurrent = gpios.ALCOHOL_SOBER.readSync();
			const drunkCurrent = gpios.ALCOHOL_DRUNK.readSync();

			if (soberCurrent === 0 && soberPrev === 1) {
				console.debug("Sober pin transition detected", {
					pin: PINS.ALCOHOL_SOBER,
					previous: soberPrev,
					current: soberCurrent,
					decision: "normal",
				});
				return "normal";
			}
			if (drunkCurrent === 0 && drunkPrev === 1) {
				console.debug("Drunk pin transition detected", {
					pin: PINS.ALCOHOL_DRUNK,
					previous: drunkPrev,
					current: drunkCurrent,
					decision: "abnormal",
				});
				return "abnormal";
			}

			soberPrev = soberCurrent;
			drunkPrev = drunkCurrent;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		console.debug("Measurement timeout reached without detection", {
			duration: Date.now() - start,
			finalSoberState: soberPrev,
			finalDrunkState: drunkPrev,
		});
		return null;
	} catch (error) {
		console.error("Alcohol measurement failed", {
			error: error.message,
			stack: error.stack,
		});
		throw error;
	}
}

export function isAlcoholSensorReadyToUse() {
	try {
		console.debug("Checking alcohol sensor readiness", {
			checkPin: PINS.ALCOHOL_READY,
		});

		const rawValue = gpios.ALCOHOL_READY.readSync();
		const isReady = rawValue === 1;

		console.debug("Alcohol readiness check result", {
			pin: PINS.ALCOHOL_READY,
			rawValue,
			isReady,
			interpretation: isReady ? "READY" : "NOT READY",
		});

		return isReady;
	} catch (error) {
		console.error("Alcohol readiness check failed", {
			error: error.message,
			pin: PINS.ALCOHOL_READY,
			stack: error.stack,
		});
		return false;
	}
}

export function toggleAlcoholSensor() {
	try {
		// Temporarily change TOGGLE pin to output
		gpios.ALCOHOL_TOGGLE.setDirection("out");
		gpios.ALCOHOL_TOGGLE.writeSync(1);
		setTimeout(() => {
			gpios.ALCOHOL_TOGGLE.writeSync(0);
			gpios.ALCOHOL_TOGGLE.setDirection("in");
		}, 500);
		return true;
	} catch (error) {
		console.error("Error toggling alcohol sensor:", error);
		return false;
	}
}

export function getContinuousAlcoholStatus() {
	const status = {
		[PINS.ALCOHOL_READY]: gpios.ALCOHOL_READY.readSync(),
		[PINS.ALCOHOL_SOBER]: gpios.ALCOHOL_SOBER.readSync(),
		[PINS.ALCOHOL_DRUNK]: gpios.ALCOHOL_DRUNK.readSync(),
		[PINS.ALCOHOL_POWER]: gpios.ALCOHOL_POWER.readSync(),
	};

	console.debug("Pin status snapshot", {
		states: Object.entries(status).map(([pin, state]) => ({
			pin: parseInt(pin),
			state: state === 1 ? "HIGH" : "LOW",
		})),
	});

	return status;
}

// Cleanup GPIO on process exit
process.on("SIGINT", () => {
	Object.values(gpios).forEach((gpio) => gpio.unexport());
});
