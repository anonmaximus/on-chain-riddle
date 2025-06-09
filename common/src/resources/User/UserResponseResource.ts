import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";

import Resource from "../Resource";
import RoleResponseRessource from "../Role/RoleResponseRessource";

export default class UserResponseResource extends Resource {
	@IsUUID(4)
	@Expose()
	public id!: string;

	@IsNotEmpty()
	@Expose()
	public address!: string;

	@Type(() => RoleResponseRessource)
	@Expose()
	public role!: RoleResponseRessource;
}
