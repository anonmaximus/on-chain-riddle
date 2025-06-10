import { AuthContext } from "@/providers/AuthProvider";
import WebSocketService, { WebSocketMessage } from "@/services/WebSocketService";
import logger from "@/utils/logger";
import { EWebsocketMessageType } from "common/enums/EWebsocketMessageType";
import { useContext, useEffect, useState } from "react";
import { container } from "tsyringe";

interface UseWebSocketResult {
	isConnected: boolean;
	lastMessage: WebSocketMessage | null;
	connect: () => Promise<void>;
	disconnect: () => void;
}

export function useWebSocket(): UseWebSocketResult {
	const [isConnected, setIsConnected] = useState(false);
	const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
	const { jwtPair } = useContext(AuthContext);

	const webSocketService = container.resolve(WebSocketService);

	useEffect(() => {
		if (!jwtPair?.accessToken) {
			logger.debug("No JWT token, skipping WebSocket connection");
			return;
		}

		const connectWebSocket = async () => {
			try {
				await webSocketService.connect(jwtPair.accessToken);
				setIsConnected(true);

				const messageTypes: EWebsocketMessageType[] = [
					EWebsocketMessageType.RIDDLE_PUBLISHED,
					EWebsocketMessageType.RIDDLE_SOLVED,
					EWebsocketMessageType.RIDDLE_PUBLISHING,
					EWebsocketMessageType.USER_SUBMISSION_UPDATE,
				];

				const unsubscribers = messageTypes.map((type) =>
					webSocketService.on(type, (message) => {
						setLastMessage(message);
					}),
				);

				return () => {
					unsubscribers.forEach((unsubscribe) => unsubscribe());
				};
			} catch (error) {
				logger.error("Failed to connect WebSocket:", error);
				setIsConnected(false);
			}
		};

		const cleanup = connectWebSocket();

		return () => {
			cleanup.then((unsubscribe) => unsubscribe?.());
			webSocketService.disconnect();
			setIsConnected(false);
		};
	}, [jwtPair?.accessToken, webSocketService]);

	const connect = async () => {
		if (!jwtPair?.accessToken) {
			throw new Error("No authentication token available");
		}
		await webSocketService.connect(jwtPair.accessToken);
		setIsConnected(true);
	};

	const disconnect = () => {
		webSocketService.disconnect();
		setIsConnected(false);
	};

	return {
		isConnected,
		lastMessage,
		connect,
		disconnect,
	};
}
