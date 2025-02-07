import { spawn } from "child_process";

const pythonProcess = spawn("python3", ["services/sensors/alcohol_gpio.py"]);

let currentState = {
	ready: 0,
	sober: 0,
	drunk: 0,
	power: 0,
};

pythonProcess.stdout.on("data", (data) => {
	const strData = data.toString().trim();
	console.log("Raw data from Python:", strData);

	try {
		const jsonData = JSON.parse(strData);
		if (!jsonData.error) {
			currentState = jsonData;
			console.log("Updated state:", currentState);
		} else {
			console.error("Python GPIO Error:", jsonData.error);
		}
	} catch (e) {
		console.error("Invalid JSON from Python:", strData);
	}
});

pythonProcess.stderr.on("data", (data) => {
	console.error("Python Process Error:", data.toString());
});

pythonProcess.on("close", (code) => {
	console.error(`Python GPIO process exited with code ${code}`);
});

export function getAlcoholSensorStatus() {
	return currentState.power === 0 ? "off" : "on";
}

export function isAlcoholSensorReadyToUse() {
	return currentState.ready === 1;
}

export async function getAlcoholValue() {
	const start = Date.now();
	const timeout = 5000;

	return new Promise((resolve) => {
		const checkState = () => {
			if (currentState.sober === 0) resolve("normal");
			if (currentState.drunk === 0) resolve("abnormal");
			if (Date.now() - start > timeout) resolve(null);
			else setTimeout(checkState, 10);
		};
		checkState();
	});
}

export function toggleAlcoholSensor() {
	pythonProcess.stdin.write("TOGGLE\n");
	return true;
}

process.on("exit", () => {
	pythonProcess.kill();
});
