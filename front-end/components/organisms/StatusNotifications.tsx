import { useWebSocket } from "@/hooks/useWebSocket";
import { WebSocketMessage } from "@/services/WebSocketService";
import { Alert } from "@heroui/react";
import { EWebsocketMessageType } from "common/enums/EWebsocketMessageType";
import React, { useEffect, useRef, useState } from "react";

interface NotificationWithId extends WebSocketMessage {
	id: string;
}

export function StatusNotifications() {
	const { lastMessage, isConnected } = useWebSocket();
	const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
	const [showConnectionStatus, setShowConnectionStatus] = useState(true);
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

	useEffect(() => {
		if (lastMessage) {
			const newNotification: NotificationWithId = {
				...lastMessage,
				id: `${lastMessage.timestamp}-${Math.random()}`,
			};

			setNotifications((prev) => [...prev, newNotification]);

			const timer = setTimeout(() => {
				setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
				timersRef.current.delete(newNotification.id);
			}, 5000);

			timersRef.current.set(newNotification.id, timer);
		}
	}, [lastMessage]);

	useEffect(() => {
		return () => {
			timersRef.current.forEach((timer) => clearTimeout(timer));
			timersRef.current.clear();
		};
	}, []);

	useEffect(() => {
		if (isConnected) {
			const timer = setTimeout(() => setShowConnectionStatus(false), 3000);
			return () => clearTimeout(timer);
		} else {
			setShowConnectionStatus(true);
		}
	}, [isConnected]);

	const getNotificationContent = (message: WebSocketMessage) => {
		switch (message.type) {
			case EWebsocketMessageType.RIDDLE_PUBLISHED:
				return {
					title: "🎯 Nouvelle Énigme Publiée !",
					description: "Une nouvelle énigme est maintenant disponible",
					color: "success" as const,
				};

			case EWebsocketMessageType.RIDDLE_SOLVED:
				return {
					title: "🎉 Énigme Résolue !",
					description: `L'énigme a été résolue par ${message.data.solver.slice(0, 6)}...${message.data.solver.slice(-4)}`,
					color: "primary" as const,
				};

			case EWebsocketMessageType.RIDDLE_PUBLISHING:
				return {
					title: "📝 Publication en cours...",
					description: message.data.message,
					color: "warning" as const,
				};

			case EWebsocketMessageType.USER_SUBMISSION_UPDATE:
				const statusEmojis = {
					pending: "⏳",
					success: "✅",
					failed: "❌",
				};
				const statusColors = {
					pending: "warning" as const,
					success: "success" as const,
					failed: "danger" as const,
				};
				return {
					title: `${statusEmojis[message.data.status as keyof typeof statusEmojis]} Mise à jour de soumission`,
					description: message.data.message || `Statut: ${message.data.status}`,
					color: statusColors[message.data.status as keyof typeof statusColors],
				};

			default:
				return {
					title: "ℹ️ Mise à jour",
					description: "Quelque chose s'est passé",
					color: "default" as const,
				};
		}
	};

	const handleClose = (notificationId: string) => {
		// Nettoyer le timer associé
		const timer = timersRef.current.get(notificationId);
		if (timer) {
			clearTimeout(timer);
			timersRef.current.delete(notificationId);
		}
		setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
	};

	return (
		<>
			<style jsx>{`
				@keyframes slideInRight {
					from {
						transform: translateX(100%);
						opacity: 0;
					}
					to {
						transform: translateX(0);
						opacity: 1;
					}
				}

				@keyframes slideOutRight {
					from {
						transform: translateX(0);
						opacity: 1;
					}
					to {
						transform: translateX(100%);
						opacity: 0;
					}
				}

				.notification-enter {
					animation: slideInRight 0.3s cubic-bezier(0.2, 0, 0.2, 1);
				}

				.notification-item {
					transition: all 0.2s ease-out;
				}
			`}</style>

			<div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
				{/* Statut de connexion */}
				{showConnectionStatus && (
					<div className="notification-enter">
						<Alert color={isConnected ? "success" : "warning"} className="shadow-lg notification-item" isClosable onClose={() => setShowConnectionStatus(false)}>
							<div className="flex items-center gap-2">
								<div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-warning"} animate-pulse`} />
								<span className="text-sm font-medium">{isConnected ? "Connecté aux mises à jour temps réel" : "Connexion aux mises à jour..."}</span>
							</div>
						</Alert>
					</div>
				)}

				{/* Notifications */}
				{notifications.map((notification) => {
					const content = getNotificationContent(notification);

					return (
						<div key={notification.id} className="notification-enter">
							<Alert color={content.color} className="shadow-lg notification-item" isClosable onClose={() => handleClose(notification.id)}>
								<div>
									<p className="font-semibold text-sm">{content.title}</p>
									<p className="text-xs mt-1 opacity-90">{content.description}</p>
								</div>
							</Alert>
						</div>
					);
				})}
			</div>
		</>
	);
}
