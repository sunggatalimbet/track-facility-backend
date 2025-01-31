import { config } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		status: "error",
		message:
			config.NODE_ENV === "production"
				? "Internal server error"
				: err.message,
	});
};
