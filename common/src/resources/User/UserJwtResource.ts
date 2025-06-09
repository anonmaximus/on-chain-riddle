import { Expose, Type } from "class-transformer";
import Resource from "../Resource";
import RoleResponseRessource from "../Role/RoleResponseRessource";

export default class UserJwtResource extends Resource {
	@Expose()
	public id!: string;

	@Expose()
	public address!: string;

	@Type(() => RoleResponseRessource)
	@Expose()
	public role!: RoleResponseRessource;
}
