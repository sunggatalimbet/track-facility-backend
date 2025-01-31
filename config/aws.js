import { S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { config } from "./env.js";

export const s3 = new S3Client({
	region: config.AWS.region,
	credentials: {
		accessKeyId: config.AWS.accessKeyId,
		secretAccessKey: config.AWS.secretAccessKey,
	},
});

export const rekognition = new RekognitionClient({
	region: config.AWS.region,
	credentials: {
		accessKeyId: config.AWS.accessKeyId,
		secretAccessKey: config.AWS.secretAccessKey,
	},
});
