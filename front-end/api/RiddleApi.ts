import BaseApi from "@/api/BaseApi";
import RiddleResponseResource from "common/resources/Riddle/RiddleResponseResource";
import RiddleStatsResponseResource from "common/resources/Riddle/RiddleStatsResponseResource";
import SubmitAnswerRequestResource from "common/resources/Riddle/SubmitAnswerRequestResource";
import SubmitAnswerResponseResource from "common/resources/Riddle/SubmitAnswerResponseResource";
import { singleton } from "tsyringe";

@singleton()
export class RiddleApi extends BaseApi {
	private baseurl = `${this.apiUrl}/riddles`;

	public async getCurrentRiddle() {
		const url = `${this.baseurl}/current`;
		return this.getRequest<RiddleResponseResource>(url);
	}

	public async getAllRiddles(skip = 0, take = 10) {
		const url = `${this.baseurl}?skip=${skip}&take=${take}`;
		return this.getRequest<RiddleResponseResource[]>(url);
	}

	public async getRiddleById(riddleId: number) {
		const url = `${this.baseurl}/${riddleId}`;
		return this.getRequest<RiddleResponseResource>(url);
	}

	public async submitAnswer(data: SubmitAnswerRequestResource) {
		const url = `${this.baseurl}/submit-answer`;
		return this.postRequest<SubmitAnswerResponseResource>(url, { ...data });
	}

	public async getMySolvedRiddles() {
		const url = `${this.baseurl}/my-solved`;
		return this.getRequest<RiddleResponseResource[]>(url);
	}

	public async getStats() {
		const url = `${this.baseurl}/stats`;
		return this.getRequest<RiddleStatsResponseResource>(url);
	}

	public async canSubmit() {
		const url = `${this.baseurl}/can-submit`;
		return this.getRequest<{ canSubmit: boolean; reason?: string }>(url);
	}
}