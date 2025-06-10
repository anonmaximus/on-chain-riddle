import { useWebSocket } from "@/hooks/useWebSocket";
import { WebSocketMessage } from "@/services/WebSocketService";
import { Alert, Progress } from "@heroui/react";
import React, { useEffect, useState } from "react";

export function StatusNotifications() {
	const { lastMessage, isConnected } = useWebSocket();
	const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
	const [showConnectionStatus, setShowConnectionStatus] = useState(true);

	useEffect(() => {
		if (lastMessage) {
			setNotifications((prev) => [...prev, lastMessage].slice(-5));

			const timer = setTimeout(() => {
				setNotifications((prev) => prev.filter((n) => n.timestamp !== lastMessage.timestamp));
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
			case "RIDDLE_PUBLISHED":
				return {
					title: "New Riddle Published!",
					description: `Riddle #${message.data.riddleId} is now available`,
					color: "success" as const,
				};

			case "RIDDLE_SOLVED":
				return {
					title: "Riddle Solved!",
					description: `Riddle #${message.data.riddleId} was solved by ${message.data.solver.slice(0, 6)}...${message.data.solver.slice(-4)}`,
					color: "primary" as const,
				};

			case "RIDDLE_PUBLISHING":
				return {
					title: "Publishing New Riddle...",
					description: message.data.message,
					color: "warning" as const,
				};

			case "USER_SUBMISSION_UPDATE":
				const statusColors = {
					pending: "warning" as const,
					success: "success" as const,
					failed: "danger" as const,
				};
				return {
					title: "Submission Update",
					description: message.data.message || `Status: ${message.data.status}`,
					color: statusColors[message.data.status as keyof typeof statusColors],
				};

			default:
				return {
					title: "Update",
					description: "Something happened",
					color: "default" as const,
				};
		}
	};

	return (
		<div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
			{showConnectionStatus && (
				<Alert color={isConnected ? "success" : "warning"} className="shadow-lg" isClosable onClose={() => setShowConnectionStatus(false)}>
					<div className="flex items-center gap-2">
						<div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-warning"} animate-pulse`} />
						{isConnected ? "Connected to real-time updates" : "Connecting to real-time updates..."}
					</div>
				</Alert>
			)}

			{notifications.map((notification) => {
				const content = getNotificationContent(notification);
				const progress = ((Date.now() - notification.timestamp) / 10000) * 100;

				return (
					<Alert
						key={notification.timestamp}
						color={content.color}
						className="shadow-lg animate-in slide-in-from-right"
						isClosable
						onClose={() => {
							setNotifications((prev) => prev.filter((n) => n.timestamp !== notification.timestamp));
						}}>
						<div className="space-y-1">
							<p className="font-semibold">{content.title}</p>
							<p className="text-sm">{content.description}</p>
							<Progress size="sm" value={100 - progress} className="mt-2" color={content.color} />
						</div>
					</Alert>
				);
			})}
		</div>
	);
}
