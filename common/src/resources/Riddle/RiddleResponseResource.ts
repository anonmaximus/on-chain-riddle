import { Expose } from "class-transformer";

import Resource from "../Resource";

export default class RiddleResponseResource extends Resource {
	@Expose()
	public id!: string;

	@Expose()
	public question!: string;

	@Expose()
	public answer?: string | null;

	@Expose()
	public isActive!: boolean;

	@Expose()
	public solvedBy?: string | null;

	@Expose()
	public solvedAt?: Date | null;

	@Expose()
	public createdAt?: Date | null;
}
