import { Expose, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

import Resource from "../Resource";

class TopSolverResource extends Resource {
	@IsString()
	@Expose()
	public address!: string;

	@IsNumber()
	@Expose()
	public count!: number;
}

export default class RiddleStatsResponseResource extends Resource {
	@IsNumber()
	@Expose()
	public totalRiddles!: number;

	@IsNumber()
	@Expose()
	public solvedRiddles!: number;

	@IsNumber()
	@IsOptional()
	@Expose()
	public activeRiddleId?: number | null;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TopSolverResource)
	@Expose()
	public topSolvers!: TopSolverResource[];
}
