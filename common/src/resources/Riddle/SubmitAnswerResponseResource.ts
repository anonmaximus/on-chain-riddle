import { Expose } from "class-transformer";

import Resource from "../Resource";

export default class SubmitAnswerResponseResource extends Resource {
	@Expose()
	public success!: boolean;

	@Expose()
	public message!: string;

	@Expose()
	public transactionHash?: string;
}
