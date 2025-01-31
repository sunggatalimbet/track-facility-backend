import { config } from "../config/env.js";

export const corsOptions = {
	origin: config.CLIENT_URL,
	methods: ["GET", "POST"],
	allowedHeaders: ["Content-Type"],
	credentials: true,
	optionsSuccessStatus: 200,
};
