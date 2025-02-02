import rpio from "@remarkablearts/rpio";
import i2c from "i2c-bus";

const MLX90614_ADDR = 0x5a; // I2C address of MLX90614
const MLX90614_TA = 0x06; // RAM address for ambient temperature
const MLX90614_TOBJ1 = 0x07; // RAM address for object temperature 1
const MLX90614_TOBJ2 = 0x08; // RAM address for object temperature 2

const PINS = {
	ALCOHOL_POWER: 23,
	ALCOHOL_SOBER: 27,
	ALCOHOL_DRUNK: 22,
	ALCOHOL_READY: 17,
	ALCOHOL_TOGGLE: 14,
};

async function getTemperatureValue() {
	try {
		// Open I2C bus 1 (GPIO 2 & 3)
		const i2cBus1 = await i2c.openPromisified(1);

		// Read ambient temperature (2 bytes)
		const ambientRaw = await i2cBus1.readWord(MLX90614_ADDR, MLX90614_TA);

		// Convert raw value to Celsius
		// Formula from datasheet: T = rawData * 0.02 - 273.15
		const ambientTemp = ambientRaw * 0.02 - 273.15;

		// Read object temperature (2 bytes)
		const objectRaw = await i2cBus1.readWord(MLX90614_ADDR, MLX90614_TOBJ1);
		const objectTemp = objectRaw * 0.02 - 273.15;

		// Log temperatures
		console.log(`Ambient Temperature: ${ambientTemp.toFixed(2)}°C`);
		console.log(`Object Temperature: ${objectTemp.toFixed(2)}°C`);

		// Close I2C bus
		await i2cBus1.close();

		// Return temperature values
		return {
			ambientTemperature: ambientTemp,
			objectTemperature: objectTemp,
		};
	} catch (error) {
		console.error("Error reading temperature:", error);
		throw error;
	}
}

function getAlcoholSensorStatus() {
	try {
		rpio.init({ mapping: "gpio" });
		rpio.open(PINS.ALCOHOL_POWER, rpio.INPUT);
		const status = rpio.read(PINS.ALCOHOL_POWER);
		rpio.close(PINS.ALCOHOL_POWER);
		return status === rpio.LOW ? "off" : "on";
	} catch (error) {
		console.error("Error reading alcohol sensor status:", error);
		return "off";
	}
}

async function getAlcoholValue() {
	try {
		rpio.init({ mapping: "gpio" });
		rpio.open(PINS.ALCOHOL_SOBER, rpio.INPUT);
		rpio.open(PINS.ALCOHOL_DRUNK, rpio.INPUT);

		// Monitor both pins for state changes
		const soberState = rpio.read(PINS.ALCOHOL_SOBER);
		const drunkState = rpio.read(PINS.ALCOHOL_DRUNK);

		rpio.close(PINS.ALCOHOL_SOBER);
		rpio.close(PINS.ALCOHOL_DRUNK);

		if (soberState === rpio.LOW) {
			return "normal";
		} else if (drunkState === rpio.LOW) {
			return "abnormal";
		}

		return null; // No definitive reading yet
	} catch (error) {
		console.error("Error reading alcohol value:", error);
		throw error;
	}
}

function isAlcoholSensorReadyToUse() {
	try {
		rpio.init({ mapping: "gpio" });
		rpio.open(PINS.ALCOHOL_READY, rpio.INPUT);
		const isReady = rpio.read(PINS.ALCOHOL_READY) === rpio.HIGH;
		rpio.close(PINS.ALCOHOL_READY);
		return isReady;
	} catch (error) {
		console.error("Error checking if alcohol sensor is ready:", error);
		return false;
	}
}

// Enhanced toggleAlcoholSensor with proper error handling
function toggleAlcoholSensor() {
	try {
		rpio.init({ mapping: "gpio" });
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

// async function getPulseValue() {
// 	try {
// 		const i2c1 = await i2c.openPromisified(1);

// 		// Initialize sensor
// 		await i2c1.writeByte(MAX30102_ADDR, MAX30102_REG_MODE_CONFIG, 0x03); // SPO2 mode
// 		await i2c1.writeByte(MAX30102_ADDR, MAX30102_REG_SPO2_CONFIG, 0x27); // SPO2 high resolution
// 		await i2c1.writeByte(MAX30102_ADDR, MAX30102_REG_LED_CONFIG, 0x24); // LED pulse amplitude
// 		await i2c1.writeByte(MAX30102_ADDR, MAX30102_REG_FIFO_CONFIG, 0x00); // Sample averaging

// 		// Wait for data collection (about 1 second)
// 		await new Promise((resolve) => setTimeout(resolve, 1000));

// 		// Read FIFO Data (simplified - would need more complex processing for accurate readings)
// 		const data = await i2c1.readWord(MAX30102_ADDR, MAX30102_REG_FIFO_DATA); // bpm, sp02

// 		// Close I2C bus
// 		await i2c1.close();

// 		// Note: This is a simplified calculation and would need more complex processing
// 		// for accurate readings in a production environment
// 		// const bpm = calculateBPM(data); // You would need to implement this
// 		// const spO2 = calculateSpO2(data); // You would need to implement this

// 		return {
// 			bpm: data.bpm,
// 			sp02: data.sp02,
// 		};
// 	} catch (error) {
// 		console.error("Error reading pulse value:", error);
// 		throw error;
// 	}
// }

export {
	getTemperatureValue,
	toggleAlcoholSensor,
	getAlcoholSensorStatus,
	getAlcoholValue,
	isAlcoholSensorReadyToUse,
	// getPulseValue,
};

export class SimulationService {
	static simulateHeartbeat() {
		return {
			timestamp: Date.now(),
			bpm: Math.floor(Math.random() * (120 - 60) + 60),
		};
	}

	static simulateTemperature() {
		return {
			timestamp: Date.now(),
			temperature: (Math.random() * (38 - 36) + 36).toFixed(1),
		};
	}

	static simulateAlcohol() {
		return {
			timestamp: Date.now(),
			alcoholLevel: (Math.random() * 0.1).toFixed(3),
		};
	}
}
export const simulationService = new SimulationService();
