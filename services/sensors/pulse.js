import i2c from "i2c-bus";
import { MAX30102_CONSTANTS } from "./constants.js";

export async function getPulseValue() {
	try {
		const i2c1 = await i2c.openPromisified(1);

		await i2c1.writeByte(
			MAX30102_CONSTANTS.ADDR,
			MAX30102_CONSTANTS.REG_MODE_CONFIG,
			0x03,
		);
		await i2c1.writeByte(
			MAX30102_CONSTANTS.ADDR,
			MAX30102_CONSTANTS.REG_SPO2_CONFIG,
			0x27,
		);
		await i2c1.writeByte(
			MAX30102_CONSTANTS.ADDR,
			MAX30102_CONSTANTS.REG_LED_CONFIG,
			0x24,
		);
		await i2c1.writeByte(
			MAX30102_CONSTANTS.ADDR,
			MAX30102_CONSTANTS.REG_FIFO_CONFIG,
			0x00,
		);

		await new Promise((resolve) => setTimeout(resolve, 1000));
		const data = await i2c1.readWord(
			MAX30102_CONSTANTS.ADDR,
			MAX30102_CONSTANTS.REG_FIFO_DATA,
		);
		await i2c1.close();

		// Note: Implement proper BPM and SpO2 calculations
		const bpm = 75; // Placeholder
		const spO2 = 98; // Placeholder

		return {
			bpm: bpm.toFixed(1),
			so2: spO2.toFixed(1),
		};
	} catch (error) {
		console.error("Error reading pulse value:", error);
		throw error;
	}
}
