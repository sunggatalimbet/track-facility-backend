import dotenv from "dotenv";
dotenv.config();

export const config = {
	CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
	PORT: process.env.PORT || 3001,
	NODE_ENV: process.env.NODE_ENV || "development",
	AWS: {
		region: process.env.AWS_REGION,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		collectionId: process.env.COLLECTION_ID,
		bucketName: process.env.BUCKET_NAME,
	},
	FIREBASE: {
		type: process.env.FIREBASE_TYPE,
		projectId: process.env.FIREBASE_PROJECT_ID,
		privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		clientId: process.env.FIREBASE_CLIENT_ID,
		authUri: process.env.FIREBASE_AUTH_URI,
		tokenUri: process.env.FIREBASE_TOKEN_URI,
		authProviderCertUrl: process.env.FIREBASE_AUTH_PROVIDER,
		clientCertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
		universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
	},
};

// validation to catch missing env variables early
const requiredEnvVars = [
	"AWS_REGION",
	"AWS_ACCESS_KEY_ID",
	"AWS_SECRET_ACCESS_KEY",
	"COLLECTION_ID",
	"BUCKET_NAME",
	"FIREBASE_TYPE",
	"FIREBASE_PROJECT_ID",
	"FIREBASE_PRIVATE_KEY_ID",
	"FIREBASE_CLIENT_EMAIL",
	"FIREBASE_CLIENT_ID",
	"FIREBASE_AUTH_URI",
	"FIREBASE_TOKEN_URI",
	"FIREBASE_AUTH_PROVIDER",
	"FIREBASE_CLIENT_CERT_URL",
	"FIREBASE_UNIVERSE_DOMAIN",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingEnvVars.join(", ")}`,
	);
}
