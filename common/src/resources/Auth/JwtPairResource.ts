import Resource from "../Resource";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export default class JwtPairResource extends Resource {
	@IsNotEmpty()
	@IsString()
	@Expose()
	public accessToken!: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	public refreshToken!: string;
}
