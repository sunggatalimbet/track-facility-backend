export const MLX90614_CONSTANTS = {
	ADDR: 0x5a,
	TA: 0x06,
	TOBJ1: 0x07,
	TOBJ2: 0x08,
};

export const MAX30102_CONSTANTS = {
	ADDR: 0x57,
	REG_FIFO_DATA: 0x07,
	REG_MODE_CONFIG: 0x09,
	REG_SPO2_CONFIG: 0x0a,
	REG_LED_CONFIG: 0x0c,
	REG_FIFO_CONFIG: 0x08,
};

export const GPIO_PINS = {
	ALCOHOL_POWER: 23,
	ALCOHOL_SOBER: 27,
	ALCOHOL_DRUNK: 22,
	ALCOHOL_READY: 17,
	ALCOHOL_TOGGLE: 14,
	HEARTBEAT: 11,
	TEMPERATURE: 13,
	ALCOHOL: 15,
};
