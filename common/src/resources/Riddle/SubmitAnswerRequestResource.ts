import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

import Resource from "../Resource";

export default class SubmitAnswerRequestResource extends Resource {
	@IsString()
	@IsNotEmpty()
	@Expose()
	public transactionHash!: string;
}
