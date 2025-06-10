import { ethers } from "ethers";
import { singleton } from "tsyringe";
import { Variables } from "#Config/Variables";
import logger from "#Services/Logger";
import { ONCHAIN_RIDDLE_ABI } from "common/abi/onchainRiddleAbi";

export interface RiddleData {
	riddle: string;
	isActive: boolean;
	winner: string;
}

@singleton()
export default class ContractService {
	private provider: ethers.JsonRpcProvider;
	private contract: ethers.Contract;
	private botWallet: ethers.Wallet;
	private botContract: ethers.Contract;

	constructor(variables: Variables) {
		this.provider = new ethers.JsonRpcProvider(variables.BLOCKCHAIN_RPC_URL);
		this.contract = new ethers.Contract(variables.CONTRACT_ADDRESS, ONCHAIN_RIDDLE_ABI, this.provider);
		this.botWallet = new ethers.Wallet(variables.BOT_PRIVATE_KEY, this.provider);
		this.botContract = new ethers.Contract(variables.CONTRACT_ADDRESS, ONCHAIN_RIDDLE_ABI, this.botWallet);
	}

	/**
	 * Get the current riddle state
	 */
	public async getCurrentRiddle(): Promise<RiddleData> {
		try {
			const [riddle, isActive, winner] = await Promise.all([this.contract["riddle"]!(), this.contract["isActive"]!(), this.contract["winner"]!()]);

			return {
				riddle,
				isActive,
				winner,
			};
		} catch (error) {
			logger.error("Error fetching current riddle:", error);
			throw error;
		}
	}

	/**
	 * Publishes a new riddle on the blockchain
	 */
	public async setRiddle(riddleText: string, answer: string): Promise<{ txHash: string }> {
		try {
			logger.info(`Publishing new riddle: ${riddleText}`);

			const answerHash = this.hashAnswer(answer.toLowerCase());
			logger.debug(`Answer hash: ${answerHash}`);

			const gasLimit = await this.botContract["setRiddle"]!.estimateGas(riddleText, answerHash);

			const tx = await this.botContract["setRiddle"]!(riddleText, answerHash, {
				gasLimit: (gasLimit * 120n) / 100n, // 20% margin
			});

			logger.info(`Transaction sent: ${tx.hash}`);

			const receipt = await tx.wait();

			logger.info(`Riddle published successfully: TX ${receipt.hash}`);

			return {
				txHash: receipt.hash,
			};
		} catch (error) {
			logger.error("Error publishing riddle:", error);
			throw error;
		}
	}

	/**
	 * Check if the current riddle has been solved by a specific address
	 */
	public async hasUserSolvedCurrentRiddle(userAddress: string): Promise<boolean> {
		try {
			const { winner, isActive } = await this.getCurrentRiddle();
			return !isActive && winner.toLowerCase() === userAddress.toLowerCase();
		} catch (error) {
			logger.error("Error checking if user solved riddle:", error);
			return false;
		}
	}

	/**
	 * Listen for RiddleSet events
	 */
	public onRiddleSet(callback: (riddle: string, event: ethers.EventLog) => void): void {
		this.contract.on("RiddleSet", (riddle, event) => {
			logger.info(`New riddle set: ${riddle}`);
			callback(riddle, event as ethers.EventLog);
		});
	}

	/**
	 * Listen for Winner events
	 */
	public onWinner(callback: (winner: string, event: ethers.EventLog) => void): void {
		this.contract.on("Winner", (winner, event) => {
			logger.info(`Riddle solved by: ${winner}`);
			callback(winner, event as ethers.EventLog);
		});
	}

	/**
	 * Listen for AnswerAttempt events
	 */
	public onAnswerAttempt(callback: (user: string, correct: boolean, event: ethers.EventLog) => void): void {
		this.contract.on("AnswerAttempt", (user, correct, event) => {
			logger.info(`Answer attempt by ${user}: ${correct ? "CORRECT" : "WRONG"}`);
			callback(user, correct, event as ethers.EventLog);
		});
	}

	/**
	 * Stop listening to all events
	 */
	public removeAllListeners(): void {
		this.contract.removeAllListeners();
	}

	/**
	 * Get the bot's balance in Ether
	 */
	public async getBotBalance(): Promise<string> {
		const balance = await this.provider.getBalance(this.botWallet.address);
		return ethers.formatEther(balance);
	}

	/**
	 * Get the bot's wallet address
	 */
	public getBotAddress(): string {
		return this.botWallet.address;
	}

	/**
	 * Hash an answer using keccak256 (same as Solidity)
	 */
	private hashAnswer(answer: string): string {
		return ethers.keccak256(ethers.toUtf8Bytes(answer));
	}
}
