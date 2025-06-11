import RiddleService from "@/services/RiddleService";
import logger from "@/utils/logger";
import { ONCHAIN_RIDDLE_ABI } from "common/abi/onchainRiddleAbi";
import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface UseContractWriteResult {
	submitAnswer: (answer: string) => Promise<void>;
	isSubmitting: boolean;
	isConfirming: boolean;
	isSuccess: boolean;
	error: Error | null;
	transactionHash?: `0x${string}`;
	reset: () => void;
}

export function useContractWrite(): UseContractWriteResult {
	const [error, setError] = useState<Error | null>(null);
	const [hasSubmit, setHasSubmit] = useState(false);
	const riddleService = container.resolve(RiddleService);

	const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

	const {
		isLoading: isConfirming,
		isSuccess: isConfirmed,
		error: confirmError,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const combinedError = error || writeError || confirmError;

	const submitAnswer = useCallback(
		async (answer: string) => {
			try {
				setError(null);

				const canSubmitResult = await riddleService.canSubmit();
				if (!canSubmitResult.canSubmit) {
					throw new Error(canSubmitResult.reason || "Cannot submit answer");
				}

				logger.info("Submitting answer to contract...");

				writeContract({
					address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
					abi: ONCHAIN_RIDDLE_ABI,
					functionName: "submitAnswer",
					args: [answer],
				});
				setHasSubmit(true);
			} catch (err) {
				logger.error("Error submitting answer:", err);
				setError(err as Error);
				throw err;
			}
		},
		[writeContract, riddleService],
	);

	useEffect(() => {
		if (isConfirmed && hash && hasSubmit) {
			logger.info("Transaction confirmed, notifying backend...");
			riddleService
				.submitAnswer(hash)
				.then(() => {
					logger.info("Backend notified successfully");
					reset();
				})
				.catch((err) => {
					logger.error("Error notifying backend:", err);
				});
		}
	}, [isConfirmed, hash, riddleService]);

	const reset = useCallback(() => {
		setError(null);
		setHasSubmit(false);
		resetWrite();
	}, [resetWrite]);

	return {
		submitAnswer,
		isSubmitting: isPending,
		isConfirming,
		isSuccess: isConfirmed,
		error: combinedError as Error | null,
		transactionHash: hash,
		reset,
	};
}
