import { UserContext } from "@/providers/UserProvider";
import RiddleService from "@/services/RiddleService";
import WebSocketService from "@/services/WebSocketService";
import logger from "@/utils/logger";
import { EWebsocketMessageType } from "common/enums/EWebsocketMessageType";
import RiddleResponseResource from "common/resources/Riddle/RiddleResponseResource";
import { useCallback, useContext, useEffect, useState } from "react";
import { container } from "tsyringe";
import { useAccount } from "wagmi";

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
	const user = useContext(UserContext);
	const { isConnected } = useAccount();

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
			if (!user || !isConnected) {
				setCanSubmit(false);
				return;
			}
			const result = await riddleService.canSubmit();
			setCanSubmit(result.canSubmit);
		} catch (err) {
			logger.error("Error checking can submit:", err);
			setCanSubmit(false);
		}
	}, [riddleService, user]);

	useEffect(() => {
		fetchCurrentRiddle();
		checkCanSubmit();
	}, [fetchCurrentRiddle, checkCanSubmit]);

	useEffect(() => {
		const unsubscribePublished = webSocketService.on(EWebsocketMessageType.RIDDLE_PUBLISHED, (message) => {
			logger.info("New riddle published:", message.data);
			fetchCurrentRiddle();
			checkCanSubmit();
		});

		const unsubscribeSolved = webSocketService.on(EWebsocketMessageType.RIDDLE_SOLVED, (message) => {
			logger.info("Riddle solved:", message.data);

			if (currentRiddle && currentRiddle.isActive) {
				const updatedRiddle = RiddleResponseResource.hydrate<RiddleResponseResource>({
					...currentRiddle,
					isActive: false,
					solvedBy: message.data.solver,
					solvedAt: new Date(),
				});

				setCurrentRiddle(updatedRiddle);
				setCanSubmit(false);
			}
		});

		const unsubscribePublishing = webSocketService.on(EWebsocketMessageType.RIDDLE_PUBLISHING, (message) => {
			logger.info("Riddle being published:", message.data);
		});

		const unsubscribeSubmission = webSocketService.on(EWebsocketMessageType.USER_SUBMISSION_UPDATE, (message) => {
			logger.info("User submission update:", message.data);
			if (message.data.status === "success") {
				fetchCurrentRiddle();
				checkCanSubmit();
			}
		});

		return () => {
			unsubscribePublished();
			unsubscribeSolved();
			unsubscribePublishing();
			unsubscribeSubmission();
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
