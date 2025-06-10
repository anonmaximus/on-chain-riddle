import { useState, useEffect, useCallback } from "react";
import { container } from "tsyringe";
import RiddleService from "@/services/RiddleService";
import WebSocketService from "@/services/WebSocketService";
import RiddleResponseResource from "common/resources/Riddle/RiddleResponseResource";
import logger from "@/utils/logger";

interface UseRiddleResult {
	currentRiddle: RiddleResponseResource | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	canSubmit: boolean;
	checkCanSubmit: () => Promise<void>;
}

export function useRiddle(): UseRiddleResult {
	const [currentRiddle, setCurrentRiddle] = useState<RiddleResponseResource | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [canSubmit, setCanSubmit] = useState(false);

	const riddleService = container.resolve(RiddleService);
	const webSocketService = container.resolve(WebSocketService);

	const fetchCurrentRiddle = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const riddle = await riddleService.getCurrentRiddle();
			setCurrentRiddle(riddle);
		} catch (err) {
			logger.error("Error fetching current riddle:", err);
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [riddleService]);

	const checkCanSubmit = useCallback(async () => {
		try {
			const result = await riddleService.canSubmit();
			setCanSubmit(result.canSubmit);
		} catch (err) {
			logger.error("Error checking can submit:", err);
			setCanSubmit(false);
		}
	}, [riddleService]);

	useEffect(() => {
		fetchCurrentRiddle();
		checkCanSubmit();
	}, [fetchCurrentRiddle, checkCanSubmit]);

	useEffect(() => {
		const unsubscribePublished = webSocketService.on("RIDDLE_PUBLISHED", (message) => {
			logger.info("New riddle published:", message.data);
			fetchCurrentRiddle();
			checkCanSubmit();
		});

		const unsubscribeSolved = webSocketService.on("RIDDLE_SOLVED", (message) => {
			logger.info("Riddle solved:", message.data);

			if (currentRiddle && currentRiddle.riddleId === message.data.riddleId) {
				const resource = RiddleResponseResource.hydrate<RiddleResponseResource>({
					...currentRiddle,
					isActive: false,
					solvedBy: message.data.solver,
					solvedAt: new Date(),
				});

				setCurrentRiddle(resource);
				setCanSubmit(false);
			}
		});

		if (currentRiddle) {
			webSocketService.subscribeToRiddle(currentRiddle.riddleId);
		}

		return () => {
			unsubscribePublished();
			unsubscribeSolved();
			if (currentRiddle) {
				webSocketService.unsubscribeFromRiddle(currentRiddle.riddleId);
			}
		};
	}, [currentRiddle, webSocketService, fetchCurrentRiddle, checkCanSubmit]);

	return {
		currentRiddle,
		isLoading,
		error,
		refetch: fetchCurrentRiddle,
		canSubmit,
		checkCanSubmit,
	};
}
