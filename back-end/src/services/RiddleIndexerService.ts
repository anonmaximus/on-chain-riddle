import logger from "#Services/Logger";
import { ethers } from "ethers";
import { singleton } from "tsyringe";

import ContractService from "./ContractService";
import RiddleService from "./RiddleService";
import WebSocketService from "./WebSocketService";

interface RiddleToPublish {
	question: string;
	answer?: string;
}

@singleton()
export default class RiddleIndexerService {
	private isListening = false;
	private riddlesToPublish: RiddleToPublish[] = [];
	private currentRiddleIndex = 0;

	constructor(
		private contractService: ContractService,
		private riddleService: RiddleService,
		private webSocketService: WebSocketService,
	) {}

	/**
	 * Starts listening for blockchain events and publishes riddles
	 */
	public async startListening() {
		if (this.isListening) {
			logger.warn("RiddleIndexer is already listening");
			return;
		}

		this.isListening = true;
		logger.info("Starting RiddleIndexer...");

		await this.loadRiddlesToPublish();

		await this.syncInitialState();

		this.setupEventListeners();

		const balance = await this.contractService.getBotBalance();
		logger.info(`Bot address: ${this.contractService.getBotAddress()}`);
		logger.info(`Bot balance: ${balance} ETH`);

		if (parseFloat(balance) < 0.01) {
			logger.warn("⚠️  Bot balance is low! Please fund the bot wallet.");
		}
	}

	/**
	 * Stop listening for blockchain events and remove all listeners
	 */
	public stopListening() {
		if (!this.isListening) return;

		this.isListening = false;
		this.contractService.removeAllListeners();
		logger.info("RiddleIndexer stopped");
	}

	/**
	 * Force the publication of the next riddle (for development purposes only)
	 */
	public async forcePublishNextRiddle() {
		return this.publishNextRiddle();
	}

	/**
	 * Get the current status of the RiddleIndexer
	 */
	public getStatus() {
		return {
			isListening: this.isListening,
			totalRiddles: this.riddlesToPublish.length,
			currentIndex: this.currentRiddleIndex,
			botAddress: this.contractService.getBotAddress(),
		};
	}

	/**
	 * Configure les listeners d'événements
	 */
	private setupEventListeners() {
		this.contractService.onRiddlePublished(async (riddleId, riddle, event) => {
			try {
				logger.info(`Processing RiddlePublished event: ID ${riddleId}`);

				await this.riddleService.upsertRiddle({
					riddleId,
					question: riddle,
					isActive: true,
					blockNumber: event.blockNumber,
					txHash: event.transactionHash,
				});

				this.webSocketService.broadcast({
					type: "RIDDLE_PUBLISHED",
					data: {
						riddleId,
						question: riddle,
						blockNumber: event.blockNumber,
						txHash: event.transactionHash,
					},
				});

				logger.info(`Riddle ${riddleId} indexed successfully`);
			} catch (error) {
				logger.error(`Error processing RiddlePublished event:`, error);
			}
		});

		this.contractService.onRiddleSolved(async (riddleId, solver, answer, event) => {
			try {
				logger.info(`Processing RiddleSolved event: ID ${riddleId} by ${solver}`);

				await this.riddleService.markRiddleAsSolved({
					riddleId,
					solvedBy: solver,
					answer,
					blockNumber: event.blockNumber,
					txHash: event.transactionHash,
				});

				this.webSocketService.broadcast({
					type: "RIDDLE_SOLVED",
					data: {
						riddleId,
						solver,
						answer,
						blockNumber: event.blockNumber,
						txHash: event.transactionHash,
					},
				});

				logger.info(`Riddle ${riddleId} marked as solved`);

				await this.publishNextRiddle();
			} catch (error) {
				logger.error(`Error processing RiddleSolved event:`, error);
			}
		});
	}

	/**
	 * Synchronise l'état initial depuis la blockchain
	 */
	private async syncInitialState() {
		try {
			logger.info("Syncing initial state from blockchain...");

			const currentRiddle = await this.contractService.getCurrentRiddle();

			if (currentRiddle.id === 0 && currentRiddle.riddle === "") {
				logger.info("No riddle found on blockchain, publishing first riddle...");
				await this.publishNextRiddle();
			} else {
				const details = await this.contractService.getRiddleDetails(currentRiddle.id);

				await this.riddleService.upsertRiddle({
					riddleId: currentRiddle.id,
					question: currentRiddle.riddle,
					isActive: currentRiddle.isActive,
					blockNumber: 0, // not available without scanning past events
					txHash: "0x", // not available without scanning past events
				});

				if (!currentRiddle.isActive && details.solver !== ethers.ZeroAddress) {
					logger.info("Current riddle is solved, publishing next one...");
					await this.publishNextRiddle();
				}
			}

			logger.info("Initial sync completed");
		} catch (error) {
			logger.error("Error during initial sync:", error);
		}
	}

	/**
	 * Loads riddles to publish from hardcoded list // Todo: replace with dynamic loading from a file or database
	 */
	private async loadRiddlesToPublish() {
		this.riddlesToPublish = [
			{
				question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
				answer: "echo",
			},
			{
				question: "The more you take, the more you leave behind. What am I?",
				answer: "footsteps",
			},
			{
				question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
				answer: "fire",
			},
			{
				question: "What has keys but no locks, space but no room, and you can enter but not go inside?",
				answer: "keyboard",
			},
			{
				question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. I have roads, but no cars. What am I?",
				answer: "map",
			},
		];
	}

	/**
	 * Publishes the next riddle in the list
	 */
	private async publishNextRiddle() {
		try {
			// Wait a bit to avoid nonce issues
			await new Promise((resolve) => setTimeout(resolve, 5000));

			if (this.riddlesToPublish.length === 0) {
				logger.warn("No more riddles to publish!");
				return;
			}

			const riddle = this.riddlesToPublish[this.currentRiddleIndex]!;
			this.currentRiddleIndex = (this.currentRiddleIndex + 1) % this.riddlesToPublish.length;

			logger.info(`Publishing riddle ${this.currentRiddleIndex}/${this.riddlesToPublish.length}: ${riddle.question}`);

			const { riddleId, txHash } = await this.contractService.setRiddle(riddle.question);

			logger.info(`Riddle published successfully: ID ${riddleId}, TX ${txHash}`);

			this.webSocketService.broadcast({
				type: "RIDDLE_PUBLISHING",
				data: {
					message: "New riddle is being published...",
					txHash,
				},
			});
		} catch (error) {
			logger.error("Error publishing next riddle:", error);

			// Retry after a delay
			setTimeout(() => {
				this.publishNextRiddle().catch(logger.error);
			}, 30000);
		}
	}
}
