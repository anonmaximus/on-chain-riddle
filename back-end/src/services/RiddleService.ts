import DbClient from "#Databases/DbClient";
import logger from "#Services/Logger";
import { singleton } from "tsyringe";

import ContractService from "./ContractService";

export interface CreateRiddleDto {
	riddleId: number;
	question: string;
	answer?: string;
	isActive: boolean;
	blockNumber: number;
	txHash: string;
}

export interface SolveRiddleDto {
	riddleId: number;
	solvedBy: string;
	answer: string;
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
			orderBy: { riddleId: "desc" },
		});

		if (!riddle) {
			logger.warn("No active riddle in database, syncing with blockchain...");
			return this.syncCurrentRiddleFromBlockchain();
		}

		return riddle;
	}

	/**
	 * Get a riddle by its ID
	 */
	public async getRiddleById(riddleId: number) {
		return this.dbClient.riddle.findUnique({
			where: { riddleId },
		});
	}

	/**
	 * Get all riddles with pagination
	 */
	public async getAllRiddles(skip = 0, take = 10) {
		const [riddles, total] = await Promise.all([
			this.dbClient.riddle.findMany({
				skip,
				take,
				orderBy: { riddleId: "desc" },
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
	 * Upsert a riddle
	 */
	public async upsertRiddle(data: CreateRiddleDto) {
		if (data.isActive) {
			await this.dbClient.riddle.updateMany({
				where: { isActive: true },
				data: { isActive: false },
			});
		}

		const riddle = await this.dbClient.riddle.upsert({
			where: { riddleId: data.riddleId },
			create: {
				riddleId: data.riddleId,
				question: data.question,
				answer: data.answer,
				isActive: data.isActive,
				blockNumber: data.blockNumber,
				txHash: data.txHash,
			},
			update: {
				question: data.question,
				isActive: data.isActive,
				blockNumber: data.blockNumber,
				txHash: data.txHash,
			},
		});

		logger.info(`Riddle ${data.riddleId} upserted successfully`);
		return riddle;
	}

	/**
	 * Mark a riddle as solved
	 */
	public async markRiddleAsSolved(data: SolveRiddleDto) {
		const riddle = await this.dbClient.riddle.update({
			where: { riddleId: data.riddleId },
			data: {
				isActive: false,
				solvedBy: data.solvedBy.toLowerCase(),
				answer: data.answer,
				solvedAt: new Date(),
			},
		});

		logger.info(`Riddle ${data.riddleId} marked as solved by ${data.solvedBy}`);
		return riddle;
	}

	/**
	 * Synchronize the current riddle from the blockchain
	 */
	private async syncCurrentRiddleFromBlockchain() {
		try {
			const currentRiddle = await this.contractService.getCurrentRiddle();

            // TODO
			// On n'a pas le txHash et blockNumber ici, donc on met des valeurs par défaut
			// Dans un cas réel, il faudrait récupérer ces infos depuis les events passés
			const riddle = await this.upsertRiddle({
				riddleId: currentRiddle.id,
				question: currentRiddle.riddle,
				isActive: currentRiddle.isActive,
				blockNumber: 0, // À récupérer depuis les events
				txHash: "0x", // À récupérer depuis les events
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
			activeRiddleId: activeRiddle?.riddleId,
			topSolvers: topSolvers.map((s) => ({
				address: s.solvedBy!,
				count: s._count.solvedBy,
			})),
		};
	}
}
