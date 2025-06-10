import { useContractWrite } from "@/hooks/useContractWrite";
import { AuthContext } from "@/providers/AuthProvider";
import { UserContext } from "@/providers/UserProvider";
import { Alert, Button, Card, CardBody, Input } from "@heroui/react";
import React, { FormEvent, useContext, useState } from "react";

interface IProps {
	canSubmit: boolean;
}

export function AnswerForm(props: IProps) {
	const { canSubmit } = props;
	const [answer, setAnswer] = useState("");
	const [isFormSubmitting, setIsFormSubmitting] = useState(false);
	const { jwtContent } = useContext(AuthContext);
	const { user } = useContext(UserContext);
	const { submitAnswer, isSubmitting, isConfirming, isSuccess, error, transactionHash, reset } = useContractWrite();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const trimmedAnswer = answer.trim();
		if (!trimmedAnswer) {
			return;
		}

		if (isSubmitting || isConfirming || isFormSubmitting) {
			return;
		}

		try {
			setIsFormSubmitting(true);
			await submitAnswer(trimmedAnswer.toLowerCase());
			setAnswer("");
		} catch (err) {
		} finally {
			setIsFormSubmitting(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAnswer(e.target.value);
		if (error) {
			reset();
		}
	};

	const hasSubmitRule = user?.role.rules.some((rule) => rule.name === "submit_riddle_answer");

	const isFormDisabled = isSubmitting || isConfirming || isFormSubmitting || !canSubmit;
	const isButtonDisabled = isFormDisabled || !answer.trim();

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
				<form onSubmit={handleSubmit} className="space-y-4">
					<h3 className="text-lg font-semibold">Submit Your Answer</h3>

					<Input
						label="Your Answer"
						placeholder="Enter your answer..."
						value={answer}
						onChange={handleInputChange}
						isDisabled={isFormDisabled}
						variant="bordered"
						size="lg"
						classNames={{
							input: "lowercase",
						}}
						autoComplete="off"
						required
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
									<a
										href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
										target="_blank"
										rel="noopener noreferrer"
										className="underline hover:text-success-700">
										{transactionHash.slice(0, 10)}...
									</a>
								</p>
							)}
						</Alert>
					)}

					<Button type="submit" color="primary" size="lg" className="w-full" isLoading={isSubmitting || isConfirming || isFormSubmitting} isDisabled={isButtonDisabled}>
						{isSubmitting || isFormSubmitting ? "Submitting..." : isConfirming ? "Confirming..." : "Submit Answer"}
					</Button>

					{isConfirming && <p className="text-sm text-center text-default-500">Please wait for blockchain confirmation...</p>}
				</form>
			</CardBody>
		</Card>
	);
}
