import DbClient from "#Databases/DbClient";
import logger from "#Services/Logger";
import { singleton } from "tsyringe";
import ContractService from "./contract/ContractService";

export interface CreateRiddleDto {
	question: string;
	isActive: boolean;
	blockNumber: number;
	txHash: string;
}

export interface SolveRiddleDto {
	answer: string;
	solvedBy: string;
	blockNumber: number;
	txHash: string;
}

@singleton()
export default class RiddleService {
	constructor(
		private dbClient: DbClient,
		private contractService: ContractService,
	) {}

	/**
	 * Get the current active riddle
	 */
	public async getCurrentRiddle() {
		const riddle = await this.dbClient.riddle.findFirst({
			where: { isActive: true },
			orderBy: { createdAt: "desc" },
		});

		if (!riddle) {
			logger.warn("No active riddle in database, syncing with blockchain...");
			return this.syncCurrentRiddleFromBlockchain();
		}

		return riddle;
	}

	/**
	 * Get all riddles with pagination
	 */
	public async getAllRiddles(skip = 0, take = 10) {
		const [riddles, total] = await Promise.all([
			this.dbClient.riddle.findMany({
				skip,
				take,
				orderBy: { createdAt: "desc" },
			}),
			this.dbClient.riddle.count(),
		]);

		return {
			riddles,
			total,
			hasMore: skip + take < total,
		};
	}

	/**
	 * Get all riddles solved by a user
	 */
	public async getUserSolvedRiddles(userAddress: string) {
		return this.dbClient.riddle.findMany({
			where: {
				solvedBy: userAddress.toLowerCase(),
				isActive: false,
			},
			orderBy: { solvedAt: "desc" },
		});
	}

	/**
	 * Create a new riddle (when published on chain)
	 */
	public async createRiddle(data: CreateRiddleDto) {
		// Deactivate any existing active riddle
		if (data.isActive) {
			await this.dbClient.riddle.updateMany({
				where: { isActive: true },
				data: { isActive: false },
			});
		}

		const riddle = await this.dbClient.riddle.create({
			data: {
				question: data.question,
				isActive: data.isActive,
				blockNumber: data.blockNumber,
				txHash: data.txHash,
			},
		});

		logger.info(`Riddle created successfully: ${riddle.id}`);
		return riddle;
	}

	/**
	 * Mark the current riddle as solved
	 */
	public async markCurrentRiddleAsSolved(data: SolveRiddleDto) {
		const currentRiddle = await this.getCurrentRiddle();

		if (!currentRiddle) {
			throw new Error("No active riddle to mark as solved");
		}

		const riddle = await this.dbClient.riddle.update({
			where: { id: currentRiddle.id },
			data: {
				isActive: false,
				solvedBy: data.solvedBy.toLowerCase(),
				solvedAt: new Date(),
				answer: data.answer,
			},
		});

		logger.info(`Riddle ${riddle.id} marked as solved by ${data.solvedBy}`);
		return riddle;
	}

	/**
	 * Synchronize the current riddle from the blockchain
	 */
	private async syncCurrentRiddleFromBlockchain() {
		try {
			const currentRiddle = await this.contractService.getCurrentRiddle();

			if (!currentRiddle.riddle || currentRiddle.riddle === "") {
				return null;
			}

			// Check if we already have this riddle in DB
			const existingRiddle = await this.dbClient.riddle.findFirst({
				where: { question: currentRiddle.riddle },
			});

			if (existingRiddle) {
				// Update its status based on blockchain
				return this.dbClient.riddle.update({
					where: { id: existingRiddle.id },
					data: {
						isActive: currentRiddle.isActive,
						solvedBy: currentRiddle.winner !== "0x0000000000000000000000000000000000000000" ? currentRiddle.winner.toLowerCase() : null,
					},
				});
			}

			// Create new riddle entry
			const riddle = await this.createRiddle({
				question: currentRiddle.riddle,
				isActive: currentRiddle.isActive,
				blockNumber: 0, // Unknown from this call
				txHash: "0x", // Unknown from this call
			});

			return riddle;
		} catch (error) {
			logger.error("Error syncing riddle from blockchain:", error);
			throw error;
		}
	}

	/**
	 * Verify if a user can submit an answer to the current riddle
	 */
	public async canUserSubmitAnswer(userAddress: string): Promise<{ canSubmit: boolean; reason?: string }> {
		const currentRiddle = await this.getCurrentRiddle();

		if (!currentRiddle) {
			return { canSubmit: false, reason: "No active riddle" };
		}

		if (!currentRiddle.isActive) {
			return { canSubmit: false, reason: "Riddle already solved" };
		}

		const hasSolved = await this.contractService.hasUserSolvedCurrentRiddle(userAddress);
		if (hasSolved) {
			return { canSubmit: false, reason: "You already solved this riddle" };
		}

		return { canSubmit: true };
	}

	/**
	 * Get statistics about riddles
	 */
	public async getStats() {
		const [totalRiddles, solvedRiddles, activeRiddle] = await Promise.all([
			this.dbClient.riddle.count(),
			this.dbClient.riddle.count({ where: { isActive: false } }),
			this.dbClient.riddle.findFirst({ where: { isActive: true } }),
		]);

		const topSolvers = await this.dbClient.riddle.groupBy({
			by: ["solvedBy"],
			where: {
				solvedBy: { not: null },
			},
			_count: {
				solvedBy: true,
			},
			orderBy: {
				_count: {
					solvedBy: "desc",
				},
			},
			take: 10,
		});

		return {
			totalRiddles,
			solvedRiddles,
			activeRiddleId: activeRiddle?.id,
			topSolvers: topSolvers.map((s) => ({
				address: s.solvedBy!,
				count: s._count.solvedBy,
			})),
		};
	}
}
