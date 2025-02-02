import admin from "firebase-admin";
import { config } from "../config/env.js";

class FirebaseService {
	constructor() {
		admin.initializeApp({
			credential: admin.credential.cert({
				type: config.FIREBASE.type,
				projectId: config.FIREBASE.projectId,
				privateKey: config.FIREBASE.privateKey,
				clientEmail: config.FIREBASE.clientEmail,
			}),
		});

		this.db = admin.firestore();
	}

	async addExaminationToWorker(
		faceId,
		// bpmData,
		temperatureData,
		alcoholData,
	) {
		try {
			// Find worker by face_id
			const workersRef = this.db.collection("trub_rem_center_workers");
			console.log(faceId);
			const querySnapshot = await workersRef
				.where("face_id", "==", faceId)
				.get();

			if (querySnapshot.empty) {
				throw new Error(`No worker found with face_id: ${faceId}`);
			}

			// Get the first matching document
			const workerDoc = querySnapshot.docs[0];
			const workerRef = workersRef.doc(workerDoc.id);

			// Add examination to the worker's examinations subcollection
			const examinationsRef = workerRef.collection("examinations");
			const examination = {
				alcohol: alcoholData.alcoholLevel,
				date_time: admin.firestore.FieldValue.serverTimestamp(),
				pulse: 0,
				temperature: Number(temperatureData.temperature),
			};

			return await examinationsRef.add(examination);
		} catch (error) {
			console.error("Examination creation error:", error);
			throw error;
		}
	}
}

export const firebaseService = new FirebaseService();
