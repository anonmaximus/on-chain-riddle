import { Expose } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

import Resource from "../Resource";

export default class SubmitAnswerResponseResource extends Resource {
	@IsBoolean()
	@Expose()
	public success!: boolean;

	@IsString()
	@IsNotEmpty()
	@Expose()
	public message!: string;

	@IsString()
	@IsOptional()
	@Expose()
	public transactionHash?: string;
}
