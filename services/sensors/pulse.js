import i2c from "i2c-bus";

class HeartRateMonitor {
	constructor() {
		this.i2cBus = i2c.openSync(1);
		this.address = 0x57;
		this.bpm = 0;
		this.spo2 = 0;
		this.running = false;
		this.irBuffer = new Array(100).fill(0);
		this.redBuffer = new Array(100).fill(0);
	}

	async initSensor() {
		try {
			// Reset the sensor
			await this.i2cBus.writeByte(this.address, 0x09, 0x40);
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Configuration settings
			await this.i2cBus.writeByte(this.address, 0x02, 0xc0);
			await this.i2cBus.writeByte(this.address, 0x03, 0x00);
			await this.i2cBus.writeByte(this.address, 0x08, 0x4f);
			await this.i2cBus.writeByte(this.address, 0x09, 0x03);
			await this.i2cBus.writeByte(this.address, 0x0a, 0x27);
			await this.i2cBus.writeByte(this.address, 0x0c, 0x24);
			await this.i2cBus.writeByte(this.address, 0x0d, 0x24);

			return true;
		} catch (error) {
			console.error("Sensor initialization failed:", error);
			return false;
		}
	}

	async readFifo() {
		try {
			const data = await this.i2cBus.readI2cBlock(
				this.address,
				0x07,
				6,
				Buffer.alloc(6),
			);
			const red = (data[0] << 16) | (data[1] << 8) | data[2];
			const ir = (data[3] << 16) | (data[4] << 8) | data[5];
			return { red, ir };
		} catch (error) {
			console.error("Error reading FIFO:", error);
			return { red: 0, ir: 0 };
		}
	}

	processData() {
		// Implement HR and SpO2 calculation logic here
		// This should be similar to the Python hrcalc implementation
		// (omitted for brevity, needs full translation of the algorithm)

		// Placeholder implementation:
		const hr = this.calculateHeartRate(this.irBuffer);
		const spo2 = this.calculateSpO2(this.redBuffer, this.irBuffer);

		return { hr, spo2 };
	}

	async start() {
		if (!(await this.initSensor())) return;

		this.running = true;
		this.readInterval = setInterval(async () => {
			const { red, ir } = await this.readFifo();

			this.irBuffer.shift();
			this.irBuffer.push(ir);
			this.redBuffer.shift();
			this.redBuffer.push(red);

			if (Date.now() % 4 === 0) {
				const result = this.processData();
				if (result.hr > 0) this.bpm = Math.round(result.hr);
				if (result.spo2 > 0) this.spo2 = Math.round(result.spo2);
			}
		}, 40);
	}

	async stop() {
		clearInterval(this.readInterval);
		this.running = false;
	}

	// Implement these methods based on hrcalc.py logic
	calculateHeartRate(irData) {
		// Simulation values for development
		return Math.floor(Math.random() * (100 - 60) + 60);
	}
	calculateSpO2(redData, irData) {
		// Simulation values for development
		return Math.floor(Math.random() * (100 - 95) + 95);
	}
}

// Singleton instance
let hrmInstance = null;

export async function getPulseValue() {
	if (!hrmInstance) {
		hrmInstance = new HeartRateMonitor();
		await hrmInstance.start();
	}

	return {
		bpm: hrmInstance.bpm,
		so2: hrmInstance.spo2,
	};
}
