declare module "@remarkablearts/rpio" {
	interface RPIO {
		init(options: {
			mapping: string;
			gpiomem: boolean;
			mock: string;
		}): void;
		INPUT: number;
		OUTPUT: number;
		HIGH: number;
		LOW: number;
		PULL_UP: number;
		open(pin: number, mode: number, pull?: number): void;
		close(pin: number): void;
		read(pin: number): number;
		write(pin: number, value: number): void;
		sleep(seconds: number): void;
		msleep(milliseconds: number): void;
	}
	const rpio: RPIO;
	export default rpio;
}
