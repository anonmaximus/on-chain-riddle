import { useContractWrite } from "@/hooks/useContractWrite";
import { AuthContext } from "@/providers/AuthProvider";
import { UserContext } from "@/providers/UserProvider";
import { Alert, Button, Card, CardBody, Input } from "@heroui/react";
import React, { useContext, useState } from "react";

interface IProps {
	canSubmit: boolean;
}

export function AnswerForm(props: IProps) {
	const { canSubmit } = props;
	const [answer, setAnswer] = useState("");
	const { jwtContent } = useContext(AuthContext);
	const { user } = useContext(UserContext);
	const { submitAnswer, isSubmitting, isConfirming, isSuccess, error, transactionHash, reset } = useContractWrite();

	const handleSubmit = async () => {
		if (!answer.trim()) {
			return;
		}

		try {
			await submitAnswer(answer.toLowerCase().trim());
			setAnswer("");
		} catch (err) {}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isSubmitting && !isConfirming) {
			handleSubmit();
		}
	};

	// Check if user has the required rule
	const hasSubmitRule = user?.role.rules.some((rule) => rule.name === "submit_riddle_answer");

	if (!jwtContent) {
		return (
			<Alert color="warning" className="max-w-2xl mx-auto">
				Please connect your wallet to submit answers.
			</Alert>
		);
	}

	if (!hasSubmitRule) {
		return (
			<Alert color="warning" className="max-w-2xl mx-auto">
				You don't have permission to submit answers. Please ensure you're authenticated.
			</Alert>
		);
	}

	if (!canSubmit) {
		return (
			<Alert color="default" className="max-w-2xl mx-auto">
				This riddle has already been solved or you've already submitted an answer.
			</Alert>
		);
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardBody>
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Submit Your Answer</h3>

					<Input
						label="Your Answer"
						placeholder="Enter your answer..."
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						onKeyPress={handleKeyPress}
						isDisabled={isSubmitting || isConfirming}
						variant="bordered"
						size="lg"
						classNames={{
							input: "lowercase",
						}}
					/>

					{error && (
						<Alert color="danger" onClose={() => reset()}>
							{error.message}
						</Alert>
					)}

					{isSuccess && (
						<Alert color="success">
							Answer submitted successfully!
							{transactionHash && (
								<p className="text-sm mt-1">
									Transaction:{" "}
									<a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">
										{transactionHash.slice(0, 10)}...
									</a>
								</p>
							)}
						</Alert>
					)}

					<Button
						color="primary"
						size="lg"
						className="w-full"
						isLoading={isSubmitting || isConfirming}
						isDisabled={!answer.trim() || isSubmitting || isConfirming}
						onPress={handleSubmit}>
						{isSubmitting ? "Submitting..." : isConfirming ? "Confirming..." : "Submit Answer"}
					</Button>

					{isConfirming && <p className="text-sm text-center text-default-500">Please wait for blockchain confirmation...</p>}
				</div>
			</CardBody>
		</Card>
	);
}
