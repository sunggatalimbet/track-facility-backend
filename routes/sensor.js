import { Router } from "express";
import {
	getTemperatureValue,
	getAlcoholSensorStatus,
	getAlcoholValue,
	isAlcoholSensorReadyToUse,
	toggleAlcoholSensor,
	getPulseValue,
} from "../services/simulation.js";
import { GPIOService } from "../services/gpio.js";
import { GPIO_PINS } from "../services/sensors/constants.js";

const router = Router();

router.get("/api/heartbeat", async (req, res, next) => {
	try {
		const data = await getPulseValue();
		const mappedValue = Math.floor(
			(parseFloat(data.bpm) - 60) * (255 / 60),
		);
		console.log(data);
		GPIOService.writePin(GPIO_PINS.HEARTBEAT, mappedValue);
		res.json({
			timestamp: Date.now(),
			bpm: data.bpm,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/api/temperature", async (req, res, next) => {
	try {
		const data = await getTemperatureValue();
		const mappedValue = Math.floor(
			(data.objectTemperature - 36) * (255 / 2),
		);
		GPIOService.writePin(GPIO_PINS.TEMPERATURE, mappedValue);
		res.json({
			timestamp: Date.now(),
			temperature: data.objectTemperature.toFixed(1),
		});
	} catch (error) {
		next(error);
	}
});

router.get("/api/alcohol", async (req, res, next) => {
	try {
		const sensorStatus = getAlcoholSensorStatus();
		const sensorReady = isAlcoholSensorReadyToUse();

		if (sensorStatus === "off" || !sensorReady) {
			toggleAlcoholSensor();
		}

		const alcoholLevel = await getAlcoholValue();
		const mappedValue = alcoholLevel === "normal" ? 0 : 255;
		GPIOService.writePin(GPIO_PINS.ALCOHOL, mappedValue);

		res.json({
			timestamp: Date.now(),
			alcoholLevel: alcoholLevel,
			sensorStatus: sensorStatus,
			sensorReady: sensorReady,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
