import { ethers } from "ethers";
import { singleton } from "tsyringe";
import { Variables } from "#Config/Variables";
import logger from "#Services/Logger";

// ABI du contrat OnchainRiddle (simplifiée, à compléter avec l'ABI complète)
const RIDDLE_CONTRACT_ABI = [
	"function getCurrentRiddle() view returns (uint256 id, string riddle, bool isActive)",
	"function submitAnswer(string answer) returns (bool)",
	"function setRiddle(string riddle) returns (uint256)",
	"function riddles(uint256) view returns (string riddle, bool isActive, address solver)",
	"event RiddlePublished(uint256 indexed riddleId, string riddle)",
	"event RiddleSolved(uint256 indexed riddleId, address indexed solver, string answer)",
];

export interface RiddleData {
	id: number;
	riddle: string;
	isActive: boolean;
}

export interface RiddleDetails {
	riddle: string;
	isActive: boolean;
	solver: string;
}

@singleton()
export default class ContractService {
	private provider: ethers.JsonRpcProvider;
	private contract: ethers.Contract;
	private botWallet: ethers.Wallet;
	private botContract: ethers.Contract;

	constructor(variables: Variables) {
		this.provider = new ethers.JsonRpcProvider(variables.BLOCKCHAIN_RPC_URL);
		this.contract = new ethers.Contract(variables.CONTRACT_ADDRESS, RIDDLE_CONTRACT_ABI, this.provider);
		this.botWallet = new ethers.Wallet(variables.BOT_PRIVATE_KEY, this.provider);
		this.botContract = new ethers.Contract(variables.CONTRACT_ADDRESS, RIDDLE_CONTRACT_ABI, this.botWallet);
	}

	/**
	 * Get the current active riddle
	 */
	public async getCurrentRiddle(): Promise<RiddleData> {
		try {
			const [id, riddle, isActive] = await this.contract.getCurrentRiddle();
			return {
				id: Number(id),
				riddle,
				isActive,
			};
		} catch (error) {
			logger.error("Error fetching current riddle:", error);
			throw error;
		}
	}

	/**
	 * Get the riddle details by ID
	 */
	public async getRiddleDetails(riddleId: number): Promise<RiddleDetails> {
		try {
			const [riddle, isActive, solver] = await this.contract.riddles(riddleId);
			return {
				riddle,
				isActive,
				solver,
			};
		} catch (error) {
			logger.error(`Error fetching riddle ${riddleId} details:`, error);
			throw error;
		}
	}

	/**
	 * Publishes a new riddle on the blockchain
	 */
	public async setRiddle(riddleText: string): Promise<{ riddleId: number; txHash: string }> {
		try {
			logger.info(`Publishing new riddle: ${riddleText}`);

			const gasLimit = await this.botContract.setRiddle.estimateGas(riddleText);

			const tx = await this.botContract.setRiddle(riddleText, {
				gasLimit: (gasLimit * 120n) / 100n, // 20% de marge
			});

			logger.info(`Transaction sent: ${tx.hash}`);

			const receipt = await tx.wait();

			const event = receipt.logs
				.map((log: any) => {
					try {
						return this.contract.interface.parseLog(log);
					} catch {
						return null;
					}
				})
				.find((e: any) => e?.name === "RiddlePublished");

			if (!event) {
				throw new Error("RiddlePublished event not found");
			}

			const riddleId = Number(event.args.riddleId);

			logger.info(`Riddle published successfully: ID ${riddleId}, TX ${receipt.hash}`);

			return {
				riddleId,
				txHash: receipt.hash,
			};
		} catch (error) {
			logger.error("Error publishing riddle:", error);
			throw error;
		}
	}

	/**
	 * Verify if a user has solved the current riddle
	 */
	public async hasUserSolvedCurrentRiddle(userAddress: string): Promise<boolean> {
		try {
			const currentRiddle = await this.getCurrentRiddle();
			if (!currentRiddle.isActive) {
				const details = await this.getRiddleDetails(currentRiddle.id);
				return details.solver.toLowerCase() === userAddress.toLowerCase();
			}
			return false;
		} catch (error) {
			logger.error("Error checking if user solved riddle:", error);
			return false;
		}
	}

	/**
	 * Listens for the RiddlePublished event and calls the provided callback
	 */
	public onRiddlePublished(callback: (riddleId: number, riddle: string, event: ethers.EventLog) => void): void {
		this.contract.on("RiddlePublished", (riddleId, riddle, event) => {
			logger.info(`New riddle published: ID ${riddleId}`);
			callback(Number(riddleId), riddle, event as ethers.EventLog);
		});
	}

	/**
	 * Listens for the RiddleSolved event and calls the provided callback
	 */
	public onRiddleSolved(callback: (riddleId: number, solver: string, answer: string, event: ethers.EventLog) => void): void {
		this.contract.on("RiddleSolved", (riddleId, solver, answer, event) => {
			logger.info(`Riddle ${riddleId} solved by ${solver}`);
			callback(Number(riddleId), solver, answer, event as ethers.EventLog);
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
}
