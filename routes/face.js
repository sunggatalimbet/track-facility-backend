import { Router } from "express";
import { RekognitionService } from "../services/rekognition.js";
import { S3Service } from "../services/s3.js";

const router = Router();

// Verify face against collection
router.post("/api/verify-face", async (req, res) => {
	try {
		const { image } = req.body;
		const imageBuffer = Buffer.from(
			image.replace(/^data:image\/\w+;base64,/, ""),
			"base64",
		);

		const result = await RekognitionService.verifyFace(imageBuffer);
		res.json(result);
	} catch (error) {
		console.error("Face verification error:", error);
		res.status(500).json({
			error: "Failed to process face verification",
		});
	}
});

// Add new face to collection
router.post("/api/add-face", async (req, res) => {
	try {
		const { image, userId } = req.body;
		const imageBuffer = Buffer.from(
			image.replace(/^data:image\/\w+;base64,/, ""),
			"base64",
		);

		// Upload image to S3
		const key = `faces/${userId}/${Date.now()}.jpg`;
		const s3Result = await S3Service.uploadImage(imageBuffer, key);

		// Index face in collection
		const indexResult = await RekognitionService.addFaceToCollection(
			s3Result.bucket,
			s3Result.key,
			userId,
		);

		res.json({
			success: true,
			faceId: indexResult.faceId,
			imageUrl: s3Result.url,
		});
	} catch (error) {
		console.error("Error adding face:", error);
		res.status(500).json({
			error: "Failed to add face to collection",
		});
	}
});

// Delete face from collection
router.delete("/api/faces/:faceId", async (req, res) => {
	try {
		const { faceId } = req.params;
		await RekognitionService.deleteFaceFromCollection(faceId);
		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting face:", error);
		res.status(500).json({
			error: "Failed to delete face from collection",
		});
	}
});

export default router;
