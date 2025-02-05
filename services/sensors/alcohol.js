import rpio from "@remarkablearts/rpio";

const PINS = {
	ALCOHOL_POWER: 23,
	ALCOHOL_SOBER: 27,
	ALCOHOL_DRUNK: 22,
	ALCOHOL_READY: 17,
	ALCOHOL_TOGGLE: 14,
};

rpio.init({ mapping: "gpio", mock: "raspi-3" });

export function getAlcoholSensorStatus() {
	try {
		rpio.open(PINS.ALCOHOL_POWER, rpio.INPUT);
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
		console.debug("Starting alcohol measurement", {
			pins: [PINS.ALCOHOL_SOBER, PINS.ALCOHOL_DRUNK],
			timeout: 5000,
		});

		// if (!isAlcoholSensorReadyToUse()) {
		// 	console.log("Sensor not ready");
		// 	return null;
		// }

		rpio.open(PINS.ALCOHOL_SOBER, rpio.INPUT);
		rpio.open(PINS.ALCOHOL_DRUNK, rpio.INPUT);

		let soberPrev = rpio.read(PINS.ALCOHOL_SOBER);
		let drunkPrev = rpio.read(PINS.ALCOHOL_DRUNK);

		const timeout = 10000;
		const start = Date.now();

		console.debug("Initial pin states", {
			soberPin: PINS.ALCOHOL_SOBER,
			soberState: soberPrev,
			drunkPin: PINS.ALCOHOL_DRUNK,
			drunkState: drunkPrev,
		});

		while (Date.now() - start < timeout) {
			const soberCurrent = rpio.read(PINS.ALCOHOL_SOBER);
			const drunkCurrent = rpio.read(PINS.ALCOHOL_DRUNK);

			if (soberCurrent === rpio.LOW && soberPrev === rpio.HIGH) {
				console.debug("Sober pin transition detected", {
					pin: PINS.ALCOHOL_SOBER,
					previous: soberPrev,
					current: soberCurrent,
					decision: "normal",
				});
				return "normal";
			}
			if (drunkCurrent === rpio.LOW && drunkPrev === rpio.HIGH) {
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
			rpio.msleep(10);
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
	} finally {
		console.debug("Closing alcohol sensor pins", {
			pins: [PINS.ALCOHOL_SOBER, PINS.ALCOHOL_DRUNK],
		});
		rpio.close(PINS.ALCOHOL_SOBER);
		rpio.close(PINS.ALCOHOL_DRUNK);
	}
}

export function isAlcoholSensorReadyToUse() {
	try {
		console.debug("Checking alcohol sensor readiness", {
			checkPin: PINS.ALCOHOL_READY,
		});

		rpio.open(PINS.ALCOHOL_READY, rpio.INPUT);
		const rawValue = rpio.read(PINS.ALCOHOL_READY);
		const isReady = rawValue === rpio.HIGH;

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
		rpio.open(PINS.ALCOHOL_TOGGLE, rpio.OUTPUT);
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
