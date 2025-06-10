import { Expose } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

import Resource from "../Resource";

export default class RiddleResponseResource extends Resource {
	@IsUUID(4)
	@Expose()
	public id!: string;

	@IsNumber()
	@Expose()
	public riddleId!: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	public question!: string;

	@IsBoolean()
	@Expose()
	public isActive!: boolean;

	@IsString()
	@IsOptional()
	@Expose()
	public solvedBy?: string | null;

	@IsDate()
	@IsOptional()
	@Expose()
	public solvedAt?: Date | null;

	@IsDate()
	@IsOptional()
	@Expose()
	public createdAt?: Date | null;
}
