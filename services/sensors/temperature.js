import i2c from "i2c-bus";

const MLX90614_ADDR = 0x5a;
const MLX90614_TA = 0x06;
const MLX90614_TOBJ1 = 0x07;

export async function getTemperatureValue() {
	try {
		const i2cBus1 = await i2c.openPromisified(1);
		const ambientRaw = await i2cBus1.readWord(MLX90614_ADDR, MLX90614_TA);
		const ambientTemp = ambientRaw * 0.02 - 273.15;
		const objectRaw = await i2cBus1.readWord(MLX90614_ADDR, MLX90614_TOBJ1);
		const objectTemp = objectRaw * 0.02 - 273.15;

		console.log(`Ambient Temperature: ${ambientTemp.toFixed(2)}°C`);
		console.log(`Object Temperature: ${objectTemp.toFixed(2)}°C`);

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
