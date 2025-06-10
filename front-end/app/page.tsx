import "reflect-metadata";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Tabs, Tab, Chip, Skeleton } from "@heroui/react";
import { useRiddle } from "@/hooks/useRiddle";
import { container } from "tsyringe";
import RiddleService from "@/services/RiddleService";
import RiddleResponseResource from "common/resources/Riddle/RiddleResponseResource";
import RiddleStatsResponseResource from "common/resources/Riddle/RiddleStatsResponseResource";
import { Navbar } from "@/components/molecules/navbar";
import { StatusNotifications } from "@/components/organisms/StatusNotifications";
import { RiddleDisplay } from "@/components/molecules/RiddleDisplay";
import { AnswerForm } from "@/components/organisms/AnswerForm";

export function RiddlePage() {
	const { currentRiddle, isLoading, error, canSubmit } = useRiddle();
	const [activeTab, setActiveTab] = useState("current");
	const [allRiddles, setAllRiddles] = useState<RiddleResponseResource[]>([]);
	const [stats, setStats] = useState<RiddleStatsResponseResource | null>(null);
	const [loadingTab, setLoadingTab] = useState(false);

	const riddleService = container.resolve(RiddleService);

	const handleTabChange = async (key: React.Key) => {
		setActiveTab(key.toString());
		setLoadingTab(true);

		try {
			if (key === "history") {
				const riddles = await riddleService.getAllRiddles(0, 20);
				setAllRiddles(riddles);
			} else if (key === "stats") {
				const statsData = await riddleService.getStats();
				setStats(statsData);
			}
		} catch (err) {
			console.error("Error loading tab data:", err);
		} finally {
			setLoadingTab(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<StatusNotifications />
			<Navbar />

			<div className="space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold">On-Chain Riddles</h1>
					<p className="text-default-500">Solve riddles on the blockchain and earn eternal glory!</p>
				</div>

				{/* Main Content */}
				<Tabs selectedKey={activeTab} onSelectionChange={handleTabChange} className="w-full">
					<Tab key="current" title="Current Riddle">
						<div className="space-y-6 mt-6">
							<RiddleDisplay riddle={currentRiddle} isLoading={isLoading} error={error} />

							{currentRiddle?.isActive && <AnswerForm canSubmit={canSubmit}  />}
						</div>
					</Tab>

					<Tab key="history" title="All Riddles">
						<div className="mt-6 space-y-4">
							{loadingTab
								? Array.from({ length: 3 }).map((_, i) => (
										<Card key={i}>
											<CardBody>
												<Skeleton className="w-full h-20 rounded-lg" />
											</CardBody>
										</Card>
									))
								: allRiddles.map((riddle) => (
										<Card key={riddle.id}>
											<CardHeader className="flex justify-between">
												<span className="font-semibold">Riddle #{riddle.riddleId}</span>
												<Chip size="sm" color={riddle.isActive ? "success" : "default"} variant="flat">
													{riddle.isActive ? "Active" : "Solved"}
												</Chip>
											</CardHeader>
											<CardBody className="space-y-2">
												<p>{riddle.question}</p>
												{riddle.solvedBy && (
													<p className="text-sm text-default-500">
														Solved by: {riddle.solvedBy.slice(0, 6)}...{riddle.solvedBy.slice(-4)}
													</p>
												)}
											</CardBody>
										</Card>
									))}
						</div>
					</Tab>

					<Tab key="stats" title="Statistics">
						<div className="mt-6">
							{loadingTab ? (
								<Card>
									<CardBody>
										<Skeleton className="w-full h-40 rounded-lg" />
									</CardBody>
								</Card>
							) : (
								stats && (
									<div className="grid gap-4 md:grid-cols-2">
										<Card>
											<CardBody className="text-center">
												<p className="text-3xl font-bold">{stats.totalRiddles}</p>
												<p className="text-default-500">Total Riddles</p>
											</CardBody>
										</Card>

										<Card>
											<CardBody className="text-center">
												<p className="text-3xl font-bold">{stats.solvedRiddles}</p>
												<p className="text-default-500">Solved Riddles</p>
											</CardBody>
										</Card>

										<Card className="md:col-span-2">
											<CardHeader>
												<h3 className="font-semibold">Top Solvers</h3>
											</CardHeader>
											<CardBody>
												<div className="space-y-2">
													{stats.topSolvers.map((solver, index) => (
														<div key={solver.address} className="flex justify-between items-center">
															<div className="flex items-center gap-2">
																<span className="font-bold text-default-500">#{index + 1}</span>
																<span className="font-mono text-sm">
																	{solver.address.slice(0, 6)}...{solver.address.slice(-4)}
																</span>
															</div>
															<Chip size="sm" variant="flat">
																{solver.count} solved
															</Chip>
														</div>
													))}
												</div>
											</CardBody>
										</Card>
									</div>
								)
							)}
						</div>
					</Tab>
				</Tabs>
			</div>
		</div>
	);
}
