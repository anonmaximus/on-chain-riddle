import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { container } from "tsyringe";
import RiddleService from "@/services/RiddleService";
import logger from "@/utils/logger";

// TODO: ABI du contrat OnchainRiddle (fonction submitAnswer uniquement)
const RIDDLE_CONTRACT_ABI = [
	{
		inputs: [
			{
				internalType: "string",
				name: "_answer",
				type: "string",
			},
		],
		name: "submitAnswer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

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
	const riddleService = container.resolve(RiddleService);

	const { writeContract, data: hash, isPending: isWriting, isSuccess: isWriteSuccess, error: writeError, reset: resetWrite } = useWriteContract();

	const {
		isLoading: isConfirming,
		isSuccess: isConfirmed,
		error: confirmError,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const submitAnswer = useCallback(
		async (answer: string) => {
			try {
				setError(null);

				const canSubmitResult = await riddleService.canSubmit();
				if (!canSubmitResult.canSubmit) {
					throw new Error(canSubmitResult.reason || "Cannot submit answer");
				}

				logger.info("Submitting answer to contract...");

				await writeContract({
					address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
					abi: RIDDLE_CONTRACT_ABI,
					functionName: "submitAnswer",
					args: [answer],
				});
			} catch (err) {
				logger.error("Error submitting answer:", err);
				setError(err as Error);
				throw err;
			}
		},
		[writeContract, riddleService],
	);

	// Notify backend after transaction confirmation
	useCallback(async () => {
		if (isConfirmed && hash) {
			try {
				logger.info("Transaction confirmed, notifying backend...");
				await riddleService.submitAnswer(hash);
			} catch (err) {
				logger.error("Error notifying backend:", err);
			}
		}
	}, [isConfirmed, hash, riddleService])();

	const combinedError = error || writeError || confirmError;

	const reset = () => {
		setError(null);
		resetWrite();
	};

	return {
		submitAnswer,
		isSubmitting: isWriting,
		isConfirming,
		isSuccess: isConfirmed,
		error: combinedError as Error | null,
		transactionHash: hash,
		reset,
	};
}
