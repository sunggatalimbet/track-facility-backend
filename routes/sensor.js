import { Router } from "express";
import { SimulationService } from "../services/simulation.js";
import { GPIOService } from "../services/gpio.js";
import { GPIO_PINS } from "../services/sensors/constants.js";

const router = Router();

router.get("/api/heartbeat", (req, res, next) => {
	try {
		const data = SimulationService.simulateHeartbeat();
		const mappedValue = Math.floor((data.bpm - 60) * (255 / 60));
		GPIOService.writePin(GPIO_PINS.HEARTBEAT, mappedValue);
		res.json(data);
	} catch (error) {
		next(error);
	}
});

router.get("/api/temperature", (req, res, next) => {
	try {
		const data = SimulationService.simulateTemperature();
		const mappedValue = Math.floor((data.temperature - 36) * (255 / 2));
		GPIOService.writePin(GPIO_PINS.TEMPERATURE, mappedValue);
		res.json(data);
	} catch (error) {
		next(error);
	}
});

router.get("/api/alcohol", (req, res, next) => {
	try {
		const data = SimulationService.simulateAlcohol();
		const mappedValue = Math.floor(data.alcoholLevel * 2550);
		GPIOService.writePin(GPIO_PINS.ALCOHOL, mappedValue);
		res.json(data);
	} catch (error) {
		next(error);
	}
});

export default router;
