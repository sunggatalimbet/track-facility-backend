import { Router } from "express";
import { firebaseService } from "../services/firebase.js";

const router = Router();

router.post("/health", async (req, res) => {
	try {
		const { faceId, bpmData, temperatureData, alcoholData } = req.body;
		const data = await firebaseService.addExaminationToWorker(
			faceId,
			bpmData,
			temperatureData,
			alcoholData,
		);
		res.json(data);
	} catch (error) {
		console.error("Face verification error:", error);
		res.status(500).json({
			error: "Failed to process face verification",
		});
	}
});

router.get("/health", (req, res) => {
	res.status(200).json({ status: "healthy" });
});

export default router;
