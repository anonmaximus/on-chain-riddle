import Config from "#Config/index";
import logger from "#Services/Logger";
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { singleton } from "tsyringe";

import AuthService from "./AuthService";

export interface WebSocketMessage {
	type: "RIDDLE_PUBLISHED" | "RIDDLE_SOLVED" | "RIDDLE_PUBLISHING" | "USER_SUBMISSION_UPDATE";
	data: any;
	timestamp?: number;
}

interface AuthenticatedSocket {
	userId?: string;
	address?: string;
}

@singleton()
export default class WebSocketService {
	private io: SocketIOServer | null = null;
	private connectedClients = new Map<string, AuthenticatedSocket>();

	constructor(
		private authService: AuthService,
		private config: Config,
	) {}

	/**
	 * Initialise the websocket server
	 */
	public initialize(server: HTTPServer) {
		this.io = new SocketIOServer(server, {
			cors: {
				origin: this.config.CROSS_DOMAIN_ORIGIN,
				credentials: true,
			},
			path: "/ws",
		});

		this.setupMiddleware();
		this.setupEventHandlers();

		logger.info("WebSocket server initialized");
	}

	/**
	 *  Setup middleware for authentication
	 */
	private setupMiddleware() {
		if (!this.io) return;

		this.io.use(async (socket, next) => {
			try {
				const token = socket.handshake.auth["token"];

				if (!token) {
					return next(new Error("Authentication required"));
				}

				const user = this.authService.validateToken(token);

				if (!user) {
					return next(new Error("Invalid token"));
				}

				(socket as any).userId = user.id;
				(socket as any).address = user.address;

				next();
			} catch (error) {
				logger.error("WebSocket authentication error:", error);
				next(new Error("Authentication failed"));
			}
		});
	}

	/**
	 *  Setup event handlers for WebSocket events
	 */
	private setupEventHandlers() {
		if (!this.io) return;

		this.io.on("connection", (socket) => {
			const userId = (socket as any).userId;
			const address = (socket as any).address;

			logger.info(`WebSocket client connected: ${userId} (${address})`);

			this.connectedClients.set(socket.id, { userId, address });

			socket.join(`user:${address.toLowerCase()}`);

			socket.on("disconnect", () => {
				logger.info(`WebSocket client disconnected: ${userId}`);
				this.connectedClients.delete(socket.id);
			});

			socket.on("ping", () => {
				socket.emit("pong", { timestamp: Date.now() });
			});

			socket.on("subscribe:riddle", (riddleId: number) => {
				socket.join(`riddle:${riddleId}`);
				logger.debug(`Client ${userId} subscribed to riddle ${riddleId}`);
			});

			// Événement pour se désabonner
			socket.on("unsubscribe:riddle", (riddleId: number) => {
				socket.leave(`riddle:${riddleId}`);
				logger.debug(`Client ${userId} unsubscribed from riddle ${riddleId}`);
			});
		});
	}

	/**
	 * Broadcast a message to all connected clients
	 */
	public broadcast(message: WebSocketMessage) {
		if (!this.io) {
			logger.warn("WebSocket server not initialized");
			return;
		}

		const messageWithTimestamp = {
			...message,
			timestamp: message.timestamp || Date.now(),
		};

		this.io.emit("update", messageWithTimestamp);
		logger.debug(`Broadcasted message: ${message.type}`);
	}

	/**
	 * Sends a message to a specific user
	 */
	public sendToUser(userAddress: string, message: WebSocketMessage) {
		if (!this.io) {
			logger.warn("WebSocket server not initialized");
			return;
		}

		const messageWithTimestamp = {
			...message,
			timestamp: message.timestamp || Date.now(),
		};

		this.io.to(`user:${userAddress.toLowerCase()}`).emit("update", messageWithTimestamp);
		logger.debug(`Sent message to user ${userAddress}: ${message.type}`);
	}

	/**
	 * Send a message to all subscribers of a specific riddle
	 */
	public sendToRiddleSubscribers(riddleId: number, message: WebSocketMessage) {
		if (!this.io) {
			logger.warn("WebSocket server not initialized");
			return;
		}

		const messageWithTimestamp = {
			...message,
			timestamp: message.timestamp || Date.now(),
		};

		this.io.to(`riddle:${riddleId}`).emit("update", messageWithTimestamp);
		logger.debug(`Sent message to riddle ${riddleId} subscribers: ${message.type}`);
	}

	/**
	 * Notify a user about the status of their submission
	 */
	public notifySubmissionStatus(userAddress: string, status: "pending" | "success" | "failed", details?: any) {
		this.sendToUser(userAddress, {
			type: "USER_SUBMISSION_UPDATE",
			data: {
				status,
				...details,
			},
		});
	}

	/**
	 * Get the count of connected clients
	 */
	public getConnectedClientsCount(): number {
		return this.connectedClients.size;
	}

	/**
	 * Get detailed statistics about connected clients
	 */
	public getConnectionStats() {
		const uniqueUsers = new Set(
			Array.from(this.connectedClients.values())
				.map((client) => client.userId)
				.filter(Boolean),
		);

		return {
			totalConnections: this.connectedClients.size,
			uniqueUsers: uniqueUsers.size,
			clients: Array.from(this.connectedClients.entries()).map(([socketId, client]) => ({
				socketId,
				userId: client.userId,
				address: client.address,
			})),
		};
	}

	/**
	 * Close the WebSocket server
	 */
	public close() {
		if (this.io) {
			this.io.close();
			this.io = null;
			logger.info("WebSocket server closed");
		}
	}
}
