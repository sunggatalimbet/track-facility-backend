declare module "@remarkablearts/rpio" {
	interface RpioStatic {
		init: (options: {
			mapping?: string;
			gpiomem?: boolean;
			mock?: string;
		}) => void;
		INPUT: number;
		OUTPUT: number;
		PULL_UP: number;
		HIGH: number;
		LOW: number;
		open: (pin: number, mode: number, pull?: number) => void;
		close: (pin: number) => void;
		read: (pin: number) => number;
		write: (pin: number, value: number) => void;
		sleep: (seconds: number) => void;
		i2cBegin: () => void;
		i2cEnd: () => void;
		i2cSetSlaveAddress: (address: number) => void;
		i2cRead: () => number;
	}

	const rpio: RpioStatic;
	export = rpio;
}
