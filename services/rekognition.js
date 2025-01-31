import {
	SearchFacesByImageCommand,
	IndexFacesCommand,
	DeleteFacesCommand,
} from "@aws-sdk/client-rekognition";
import { rekognition } from "../config/aws.js";
import { config } from "../config/env.js";

export class RekognitionService {
	static async verifyFace(imageBuffer) {
		const params = {
			CollectionId: config.AWS.collectionId,
			Image: { Bytes: imageBuffer },
			MaxFaces: 1,
			FaceMatchThreshold: 90,
		};

		try {
			const command = new SearchFacesByImageCommand(params);
			const response = await rekognition.send(command);

			if (response.FaceMatches?.length > 0) {
				const match = response.FaceMatches[0];
				return {
					matched: true,
					similarity: match.Similarity,
					faceId: match.Face.FaceId,
				};
			}
			return { matched: false };
		} catch (error) {
			if (error.name === "InvalidParameterException") {
				return {
					matched: false,
					error: "No face detected in image",
				};
			}
			throw error;
		}
	}

	static async addFaceToCollection(bucket, key, userId) {
		const params = {
			CollectionId: config.AWS.collectionId,
			Image: {
				S3Object: {
					Bucket: bucket,
					Name: key,
				},
			},
			MaxFaces: 1,
			DetectionAttributes: ["ALL"],
			ExternalImageId: userId,
		};

		try {
			const command = new IndexFacesCommand(params);
			const response = await rekognition.send(command);

			if (response.FaceRecords?.length > 0) {
				const faceRecord = response.FaceRecords[0];
				return {
					success: true,
					faceId: faceRecord.Face.FaceId,
					confidence: faceRecord.Face.Confidence,
					boundingBox: faceRecord.Face.BoundingBox,
				};
			} else {
				throw new Error("No face detected in the image");
			}
		} catch (error) {
			console.error("Error indexing face:", error);
			throw error;
		}
	}

	static async deleteFaceFromCollection(faceId) {
		const params = {
			CollectionId: config.AWS.collectionId,
			FaceIds: [faceId],
		};

		try {
			const command = new DeleteFacesCommand(params);
			await rekognition.send(command);
			return { success: true };
		} catch (error) {
			console.error("Error deleting face:", error);
			throw error;
		}
	}
}
