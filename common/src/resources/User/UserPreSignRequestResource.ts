import { Expose } from "class-transformer";
import Resource from "../Resource";
import { IsNotEmpty } from "class-validator";

export default class UserPreSignRequestResource extends Resource {
	@IsNotEmpty()
	@Expose()
	public address!: string;
}
