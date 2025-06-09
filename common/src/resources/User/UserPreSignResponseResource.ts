import { Expose } from "class-transformer";

import Resource from "../Resource";

export default class UserPreSignResponseResource extends Resource {
	@Expose()
	public id!: string;

	@Expose()
	public address!: string;

	@Expose()
	public messageToSign!: string;
}
