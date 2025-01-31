import i2c from "i2c-bus";
import { MLX90614_CONSTANTS } from "./constants.js";

export async function getTemperatureValue() {
	try {
		const i2cBus1 = await i2c.openPromisified(1);
		const ambientRaw = await i2cBus1.readWord(
			MLX90614_CONSTANTS.ADDR,
			MLX90614_CONSTANTS.TA,
		);
		const ambientTemp = ambientRaw * 0.02 - 273.15;
		const objectRaw = await i2cBus1.readWord(
			MLX90614_CONSTANTS.ADDR,
			MLX90614_CONSTANTS.TOBJ1,
		);
		const objectTemp = objectRaw * 0.02 - 273.15;

		await i2cBus1.close();

		return {
			ambientTemperature: ambientTemp,
			objectTemperature: objectTemp,
		};
	} catch (error) {
		console.error("Error reading temperature:", error);
		throw error;
	}
}
