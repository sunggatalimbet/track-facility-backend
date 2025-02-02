import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);
const router = Router();

// Endpoint для захвата изображения с RPi камеры
router.get("/api/camera/capture", async (req, res) => {
	try {
		const tempFile = `/tmp/capture_${Date.now()}.jpg`;

		// Захват изображения с помощью libcamera-still
		await execAsync(`libcamera-still -n -o ${tempFile} --immediate -t 1`);

		// Чтение файла и конвертация в base64
		const image = await fs.readFile(tempFile);
		const base64 = image.toString("base64");

		// Удаление временного файла
		await fs.unlink(tempFile);

		res.json({
			success: true,
			image: `data:image/jpeg;base64,${base64}`,
		});
	} catch (error) {
		console.error("Camera capture error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to capture image",
		});
	}
});

export default router;
