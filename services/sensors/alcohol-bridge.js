import { spawn } from "child_process";

const pythonProcess = spawn("python3", ["services/sensors/alcohol_gpio.py"]);
const MONITOR_INTERVAL = 1000; // 1 second interval

let currentState = {
	ready: 0,
	sober: 0,
	drunk: 0,
	power: 0,
};

// Add pin monitoring with detailed values
function monitorPins() {
	setInterval(() => {
		console.log("\n=== GPIO Pin States ===");
		Object.entries(currentState).forEach(([key, value]) => {
			const state = value ? "HIGH (1)" : "LOW (0)";
			console.log(`${key.padEnd(10)}: ${state}`);
		});
		console.log("=====================\n");
	}, MONITOR_INTERVAL);
}

// Start monitoring when process starts
monitorPins();

pythonProcess.stdout.on("data", (data) => {
	const strData = data.toString().trim();
	try {
		const jsonData = JSON.parse(strData);
		if (!jsonData.error) {
			currentState = jsonData;
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

	console.log("\nStarting alcohol value check...");
	console.log("Initial pin states:", JSON.stringify(currentState, null, 2));

	return new Promise((resolve) => {
		const checkState = () => {
			if (currentState.sober === 0) {
				console.log("\n🟢 SOBER pin triggered:");
				console.log(JSON.stringify(currentState, null, 2));
				resolve("normal");
			}
			if (currentState.drunk === 0) {
				console.log("\n🔴 DRUNK pin triggered:");
				console.log(JSON.stringify(currentState, null, 2));
				resolve("abnormal");
			}
			if (Date.now() - start > timeout) {
				console.log("\n⚠️ Timeout reached. Final states:");
				console.log(JSON.stringify(currentState, null, 2));
				resolve(null);
			} else setTimeout(checkState, 10);
		};
		checkState();
	});
}

export function toggleAlcoholSensor() {
	console.log("\n🔄 Toggling alcohol sensor...");
	pythonProcess.stdin.write("TOGGLE\n");
	return true;
}

process.on("exit", () => {
	pythonProcess.kill();
});
