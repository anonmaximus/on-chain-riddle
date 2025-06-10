import logger from "#Services/Logger";
import { ethers } from "ethers";
import { singleton } from "tsyringe";

import ContractService from "./contract/ContractService";
import RiddleService from "./RiddleService";
import WebSocketService from "./WebSocketService";

interface RiddleToPublish {
	question: string;
	answer: string; // Required now for hashing
}

@singleton()
export default class RiddleIndexerService {
	private isListening = false;
	private riddlesToPublish: RiddleToPublish[] = [];

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
	 * Configure event listeners
	 */
	private setupEventListeners() {
		this.contractService.onRiddleSet(async (riddle, event) => {
			try {
				logger.info(`Processing RiddleSet event: ${riddle}`);

				await this.riddleService.createRiddle({
					question: riddle,
					isActive: true,
					blockNumber: event.blockNumber || 0,
					txHash: event.transactionHash || "0x",
				});

				this.webSocketService.broadcast({
					type: "RIDDLE_PUBLISHED",
					data: {
						question: riddle,
						blockNumber: event.blockNumber,
						txHash: event.transactionHash,
					},
				});

				logger.info(`Riddle indexed successfully`);
			} catch (error) {
				logger.error(`Error processing RiddleSet event:`, error);
			}
		});

		this.contractService.onWinner(async (winner, event) => {
			try {
				logger.info(`Processing Winner event: ${winner}`);

				const currentRiddle = await this.riddleService.getCurrentRiddle();

				const answer = this.riddlesToPublish.find((r) => r.question === currentRiddle?.question)?.answer || "";

				await this.riddleService.markCurrentRiddleAsSolved({
					solvedBy: winner,
					blockNumber: event.blockNumber,
					txHash: event.transactionHash,
					answer,
				});

				this.webSocketService.broadcast({
					type: "RIDDLE_SOLVED",
					data: {
						solver: winner,
						blockNumber: event.blockNumber,
						txHash: event.transactionHash,
					},
				});

				logger.info(`Riddle marked as solved`);

				await this.publishNextRiddle();
			} catch (error) {
				logger.error(`Error processing Winner event:`, error);
			}
		});

		this.contractService.onAnswerAttempt(async (user, correct, event) => {
			try {
				this.webSocketService.notifySubmissionStatus(user, correct ? "success" : "failed", {
					message: correct ? "Congratulations! You solved the riddle!" : "Wrong answer, try again!",
					transactionHash: event.transactionHash,
				});
			} catch (error) {
				logger.error(`Error processing AnswerAttempt event:`, error);
			}
		});
	}

	/**
	 * Synchronize initial state from blockchain
	 */
	private async syncInitialState() {
		try {
			logger.info("Syncing initial state from blockchain...");

			const currentRiddle = await this.contractService.getCurrentRiddle();

			if (!currentRiddle.riddle || currentRiddle.riddle === "") {
				logger.info("No riddle found on blockchain, publishing first riddle...");
				await this.publishNextRiddle();
			} else if (!currentRiddle.isActive && currentRiddle.winner !== ethers.ZeroAddress) {
				logger.info("Current riddle is solved, publishing next one...");
				await this.publishNextRiddle();
			}

			logger.info("Initial sync completed");
		} catch (error) {
			logger.error("Error during initial sync:", error);
		}
	}

	/**
	 * Load riddles to publish
	 * It is hardcoded for now, but can be replaced with a database or external source in the future
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

		logger.info(`Loaded ${this.riddlesToPublish.length} riddles to publish`);
	}

	/**
	 * Publish the next riddle
	 */
	private async publishNextRiddle() {
		try {
			// Wait a bit to avoid nonce issues
			await new Promise((resolve) => setTimeout(resolve, 5000));

			if (this.riddlesToPublish.length === 0) {
				logger.warn("No more riddles to publish!");
				return;
			}

			const currentRiddle = await this.riddleService.getCurrentRiddle();
			const currentRiddleIndex = currentRiddle?.index ?? 0;

			const nextRiddleIndex = (currentRiddleIndex + 1) % this.riddlesToPublish.length;
			const riddle = this.riddlesToPublish[nextRiddleIndex]!;

			logger.info(`Publishing riddle ${nextRiddleIndex}/${this.riddlesToPublish.length}: ${riddle.question}`);

			const { txHash } = await this.contractService.setRiddle(riddle.question, riddle.answer);

			logger.info(`Riddle published successfully: TX ${txHash}`);

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
