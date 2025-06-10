import React from "react";
import { Card, CardBody, CardHeader, Chip, Skeleton } from "@heroui/react";
import RiddleResponseResource from "common/resources/Riddle/RiddleResponseResource";

interface IProps {
	riddle: RiddleResponseResource | null;
	isLoading: boolean;
	error: Error | null;
}

export function RiddleDisplay(props: IProps) {
	const { riddle, isLoading, error } = props;
	if (isLoading) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader className="flex gap-3">
					<Skeleton className="w-32 h-6 rounded-lg" />
				</CardHeader>
				<CardBody>
					<Skeleton className="w-full h-20 rounded-lg" />
				</CardBody>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full max-w-2xl mx-auto border-danger">
				<CardBody>
					<p className="text-danger text-center">Error loading riddle: {error.message}</p>
				</CardBody>
			</Card>
		);
	}

	if (!riddle) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardBody>
					<p className="text-center text-default-500">No riddle available at the moment.</p>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader className="flex justify-between items-center">
				<div className="flex gap-3 items-center">
					<h2 className="text-xl font-bold">Riddle #{riddle.riddleId}</h2>
					<Chip color={riddle.isActive ? "success" : "default"} variant="flat" size="sm">
						{riddle.isActive ? "Active" : "Solved"}
					</Chip>
				</div>
			</CardHeader>
			<CardBody className="gap-4">
				<div className="bg-default-100 rounded-lg p-6">
					<p className="text-lg font-medium text-center">{riddle.question}</p>
				</div>

				{!riddle.isActive && riddle.solvedBy && (
					<div className="text-sm text-default-500 text-center space-y-1">
						<p>
							Solved by:{" "}
							<span className="font-mono">
								{riddle.solvedBy.slice(0, 6)}...{riddle.solvedBy.slice(-4)}
							</span>
						</p>
						{riddle.solvedAt && <p>Solved at: {new Date(riddle.solvedAt).toLocaleString()}</p>}
					</div>
				)}
			</CardBody>
		</Card>
	);
}
