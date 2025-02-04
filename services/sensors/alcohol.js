import rpio from "@remarkablearts/rpio";

const PINS = {
	ALCOHOL_POWER: 23,
	ALCOHOL_SOBER: 27,
	ALCOHOL_DRUNK: 22,
	ALCOHOL_READY: 17,
	ALCOHOL_TOGGLE: 14,
};

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
		if (!isAlcoholSensorReadyToUse()) {
			console.log("Sensor not ready");
			return null;
		}

		rpio.open(PINS.ALCOHOL_SOBER, rpio.INPUT);
		rpio.open(PINS.ALCOHOL_DRUNK, rpio.INPUT);

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
		rpio.open(PINS.ALCOHOL_READY, rpio.INPUT);
		const isReady = rpio.read(PINS.ALCOHOL_READY) === rpio.HIGH;
		rpio.close(PINS.ALCOHOL_READY);
		return isReady;
	} catch (error) {
		console.error("Error checking if alcohol sensor is ready:", error);
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
