import { useWebSocket } from "@/hooks/useWebSocket";
import { WebSocketMessage } from "@/services/WebSocketService";
import { Alert, Progress } from "@heroui/react";
import { EWebsocketMessageType } from "common/enums/EWebsocketMessageType";
import React, { useCallback, useEffect, useState } from "react";

interface NotificationWithId extends WebSocketMessage {
	id: string;
	progress: number;
}

export function StatusNotifications() {
	const { lastMessage, isConnected } = useWebSocket();
	const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
	const [showConnectionStatus, setShowConnectionStatus] = useState(true);

	const updateProgress = useCallback(() => {
		setNotifications((prev) =>
			prev.map((notification) => {
				const elapsed = Date.now() - notification.timestamp;
				const progress = Math.min((elapsed / 10000) * 100, 100);
				return { ...notification, progress };
			}),
		);
	}, []);

	useEffect(() => {
		if (notifications.length === 0) return;

		const interval = setInterval(updateProgress, 50);
		return () => clearInterval(interval);
	}, [notifications.length, updateProgress]);

	useEffect(() => {
		if (lastMessage) {
			const newNotification: NotificationWithId = {
				...lastMessage,
				id: `${lastMessage.timestamp}-${Math.random()}`,
				progress: 0,
			};

			setNotifications((prev) => [...prev, newNotification].slice(-5));

			const timer = setTimeout(() => {
				setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [lastMessage]);

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
					description: `Une nouvelle énigme est maintenant disponible`,
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
				const statusColors = {
					pending: "warning" as const,
					success: "success" as const,
					failed: "danger" as const,
				};
				const statusEmojis = {
					pending: "⏳",
					success: "✅",
					failed: "❌",
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

				@keyframes fadeInScale {
					from {
						transform: scale(0.9);
						opacity: 0;
					}
					to {
						transform: scale(1);
						opacity: 1;
					}
				}

				.toast-enter {
					animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.toast-exit {
					animation: slideOutRight 0.2s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.connection-status {
					animation: fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.progress-bar-smooth {
					transition: all 0.1s ease-out;
				}
			`}</style>

			<div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
				{showConnectionStatus && (
					<div className="connection-status">
						<Alert
							color={isConnected ? "success" : "warning"}
							className="shadow-lg backdrop-blur-sm bg-opacity-95"
							isClosable
							onClose={() => setShowConnectionStatus(false)}>
							<div className="flex items-center gap-2">
								<div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-warning"} animate-pulse`} />
								<span className="text-sm font-medium">{isConnected ? "Connecté aux mises à jour temps réel" : "Connexion aux mises à jour..."}</span>
							</div>
						</Alert>
					</div>
				)}

				{notifications.map((notification) => {
					const content = getNotificationContent(notification);
					const isExpiring = notification.progress > 80;

					return (
						<div key={notification.id} className="toast-enter">
							<Alert
								color={content.color}
								className={`shadow-lg backdrop-blur-sm bg-opacity-95 border transition-all duration-200 ${
									isExpiring ? "scale-95 opacity-90" : "scale-100 opacity-100"
								}`}
								isClosable
								onClose={() => handleClose(notification.id)}>
								<div className="space-y-2">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm leading-tight">{content.title}</p>
											<p className="text-xs mt-1 opacity-90 leading-relaxed">{content.description}</p>
										</div>
									</div>

									<div className="relative">
										<Progress size="sm" value={100 - notification.progress} className="progress-bar-smooth" color={content.color} showValueLabel={false} />
										<div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
									</div>
								</div>
							</Alert>
						</div>
					);
				})}
			</div>
		</>
	);
}
