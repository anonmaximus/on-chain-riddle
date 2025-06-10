import logger from "@/utils/logger";
import { io, Socket } from "socket.io-client";
import { singleton } from "tsyringe";

export interface WebSocketMessage {
	type: "RIDDLE_PUBLISHED" | "RIDDLE_SOLVED" | "RIDDLE_PUBLISHING" | "USER_SUBMISSION_UPDATE";
	data: any;
	timestamp: number;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

@singleton()
export default class WebSocketService {
	private socket: Socket | null = null;
	private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;

	/**
	 * Connects to the WebSocket server with authentication
	 */
	public connect(jwtToken: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.socket?.connected) {
				resolve();
				return;
			}

			const wsBaseUrl = process.env.NEXT_PUBLIC_API_URL;

			this.socket = io(wsBaseUrl, {
				path: "/ws",
				auth: {
					token: jwtToken,
				},
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: this.maxReconnectAttempts,
				reconnectionDelay: this.reconnectDelay,
			});

			this.setupEventHandlers();

			this.socket.on("connect", () => {
				logger.info("WebSocket connected");
				this.reconnectAttempts = 0;
				resolve();
			});

			this.socket.on("connect_error", (error) => {
				logger.error("WebSocket connection error:", error.message);
				if (this.reconnectAttempts >= this.maxReconnectAttempts) {
					reject(new Error("Failed to connect to WebSocket server"));
				}
				this.reconnectAttempts++;
			});
		});
	}

	/**
	 * Setup the event handlers for the WebSocket connection
	 */
	private setupEventHandlers() {
		if (!this.socket) return;

		this.socket.on("update", (message: WebSocketMessage) => {
			logger.debug("WebSocket message received:", message);
			this.notifyHandlers(message.type, message);
		});

		this.socket.on("disconnect", (reason) => {
			logger.warn("WebSocket disconnected:", reason);
		});

		this.socket.on("reconnect", (attemptNumber) => {
			logger.info("WebSocket reconnected after", attemptNumber, "attempts");
		});

		this.socket.on("pong", (data) => {
			logger.debug("Pong received:", data);
		});

		this.startPingInterval();
	}

	/**
	 * Start a ping interval to keep the connection alive
	 */
	private startPingInterval() {
		if (!this.socket) return;

		setInterval(() => {
			if (this.socket?.connected) {
				this.socket.emit("ping");
			}
		}, 30000);
	}

	/**
	 * Registers an event handler
	 */
	public on(eventType: WebSocketMessage["type"], handler: WebSocketEventHandler): () => void {
		if (!this.eventHandlers.has(eventType)) {
			this.eventHandlers.set(eventType, new Set());
		}

		this.eventHandlers.get(eventType)!.add(handler);

		return () => {
			this.off(eventType, handler);
		};
	}

	/**
	 * Removes an event handler
	 */
	public off(eventType: WebSocketMessage["type"], handler: WebSocketEventHandler) {
		const handlers = this.eventHandlers.get(eventType);
		if (handlers) {
			handlers.delete(handler);
			if (handlers.size === 0) {
				this.eventHandlers.delete(eventType);
			}
		}
	}

	/**
	 * Notifies all handlers for a specific event type
	 */
	private notifyHandlers(eventType: WebSocketMessage["type"], message: WebSocketMessage) {
		const handlers = this.eventHandlers.get(eventType);
		if (handlers) {
			handlers.forEach((handler) => {
				try {
					handler(message);
				} catch (error) {
					logger.error("Error in WebSocket event handler:", error);
				}
			});
		}
	}

	/**
	 * Disconnects the WebSocket connection and clears event handlers
	 */
	public disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.eventHandlers.clear();
			logger.info("WebSocket disconnected");
		}
	}

	/**
	 * Verify if the WebSocket is connected
	 */
	public isConnected(): boolean {
		return this.socket?.connected || false;
	}

	/**
	 * Get the current WebSocket connection ID
	 */
	public getSocketId(): string | undefined {
		return this.socket?.id;
	}
}