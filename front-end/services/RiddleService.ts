import { RiddleApi } from "@/api/RiddleApi";
import SubmitAnswerRequestResource from "common/resources/Riddle/SubmitAnswerRequestResource";
import { singleton } from "tsyringe";

@singleton()
export default class RiddleService {
	constructor(private api: RiddleApi) {}

	public getCurrentRiddle() {
		return this.api.getCurrentRiddle();
	}

	public getAllRiddles(skip?: number, take?: number) {
		return this.api.getAllRiddles(skip, take);
	}

	public submitAnswer(transactionHash: string) {
		const resource = SubmitAnswerRequestResource.hydrate<SubmitAnswerRequestResource>({
			transactionHash,
		});
		return this.api.submitAnswer(resource);
	}

	public getMySolvedRiddles() {
		return this.api.getMySolvedRiddles();
	}

	public getStats() {
		return this.api.getStats();
	}

	public canSubmit() {
		return this.api.canSubmit();
	}
}
