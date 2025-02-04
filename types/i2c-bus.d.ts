declare module "i2c-bus" {
	interface I2CBus {
		openSync(busNumber: number): any;
		// Add other methods as needed
	}
	const i2c: I2CBus;
	export default i2c;
}
