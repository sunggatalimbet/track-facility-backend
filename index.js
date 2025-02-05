import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { config } from "./config/env.js";
import { corsOptions } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { SocketHandler } from "./socket/handler.js";
import { GPIOService } from "./services/gpio.js";
import healthRoutes from "./routes/health.js";
import faceRoutes from "./routes/face.js";
import cameraRoutes from "./routes/camera.js";

dotenv.config();

const app = express();

GPIOService.init();

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.disable("x-powered-by");

// Routes
app.use(healthRoutes);
app.use(faceRoutes);
app.use(cameraRoutes);

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: [config.CLIENT_URL],
		methods: ["GET", "POST"],
		credentials: true,
	},
	transports: ["websocket", "polling"],
	pingTimeout: 60000,
	pingInterval: 25000,
	connectTimeout: 5000,
});

io.on("connection", SocketHandler.handleConnection);

process.on("SIGTERM", () => {
	console.log("SIGTERM received. Shutting down gracefully...");
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});

server.listen(config.PORT, () => {
	console.log(
		`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`,
	);
});
