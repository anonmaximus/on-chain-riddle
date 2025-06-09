import { Expose, Type } from "class-transformer";
import Resource from "../Resource";
import { IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import RulesResponseRessource from "../Rules/RulesResponseRessource";

export default class RoleResponseRessource extends Resource {
	@IsUUID(4)
	@Expose()
	public id!: string;

	@IsNotEmpty()
	@Expose()
	public name!: string;

	@IsNotEmpty()
	@Expose()
	@Type(() => RulesResponseRessource, {})
	@ValidateNested()
	public rules!: RulesResponseRessource[];
}
