import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";
import { config } from "../config/env.js";

export class S3Service {
	static async uploadImage(imageBuffer, key) {
		const params = {
			Bucket: config.AWS.bucketName,
			Key: key,
			Body: imageBuffer,
			ContentType: "image/jpeg",
		};

		try {
			const command = new PutObjectCommand(params);
			await s3.send(command);

			return {
				success: true,
				bucket: config.AWS.bucketName,
				key: key,
				url: `https://${config.AWS.bucketName}.s3.${config.AWS.region}.amazonaws.com/${key}`,
			};
		} catch (error) {
			console.error("Error uploading to S3:", error);
			throw new Error("Failed to upload image to S3");
		}
	}

	static async deleteImage(key) {
		const params = {
			Bucket: config.AWS.bucketName,
			Key: key,
		};

		try {
			const command = new DeleteObjectCommand(params);
			await s3.send(command);
			return { success: true };
		} catch (error) {
			console.error("Error deleting from S3:", error);
			throw new Error("Failed to delete image from S3");
		}
	}
}
