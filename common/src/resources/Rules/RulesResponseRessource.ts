import { Expose } from "class-transformer";
import Resource from "../Resource";
import { IsNotEmpty, IsUUID } from "class-validator";
import { ERuleName } from "../../enums/ERuleName";

export default class RulesResponseRessource extends Resource {
	@IsUUID(4)
	@Expose()
	public id!: string;

	@IsNotEmpty()
	@Expose()
	public name!: ERuleName;
}
