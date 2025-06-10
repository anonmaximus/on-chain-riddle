import { Expose, Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";

import Resource from "../Resource";

class TopSolverResource extends Resource {
	@Expose()
	public address!: string;

	@Expose()
	public count!: number;
}

export default class RiddleStatsResponseResource extends Resource {
	@Expose()
	public totalRiddles!: number;

	@Expose()
	public solvedRiddles!: number;

	@Expose()
	public activeRiddleId?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TopSolverResource)
	@Expose()
	public topSolvers!: TopSolverResource[];
}
