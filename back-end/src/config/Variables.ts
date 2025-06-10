import { IsNotEmpty, IsOptional, validateSync, IsEnum, IsNumberString } from "class-validator";
import { singleton } from "tsyringe";

@singleton()
export class Variables {
	@IsOptional()
	@IsEnum(["edge", "default"])
	public readonly PRISMA_CLIENT_MODE?: "edge" | "default" = process.env["PRISMA_CLIENT_MODE"] as typeof this.PRISMA_CLIENT_MODE;

	@IsNotEmpty()
	public readonly DATABASE_URL: string = process.env["DATABASE_URL"]!;

	@IsNotEmpty()
	@IsNumberString()
	public readonly APP_PORT: string = process.env["APP_PORT"]!;

	@IsNotEmpty()
	public readonly ACCESS_TOKEN_SECRET: string = process.env["ACCESS_TOKEN_SECRET"]!;

	@IsNotEmpty()
	public readonly REFRESH_TOKEN_SECRET: string = process.env["REFRESH_TOKEN_SECRET"]!;

	@IsNotEmpty()
	public readonly PSWD_SALT: string = process.env["PSWD_SALT"]!;

	@IsNotEmpty()
	@IsOptional()
	public readonly DEV_CRON_PORT: string = process.env["DEV_CRON_PORT"]!;

	@IsNotEmpty()
	public readonly NEXTJS_HOST: string = process.env["NEXTJS_HOST"]!;

	@IsNumberString()
	@IsNotEmpty()
	public readonly NEXTJS_PORT: string = process.env["NEXTJS_PORT"]!;

	@IsNotEmpty()
	@IsEnum(["development", "staging", "production"])
	public readonly APP_ENV: "development" | "staging" | "production" = process.env["APP_ENV"]! as typeof this.APP_ENV;

    @IsNotEmpty()
    public readonly BLOCKCHAIN_RPC_URL: string = process.env["BLOCKCHAIN_RPC_URL"]!;

    @IsNotEmpty()
    public readonly CONTRACT_ADDRESS: string = process.env["CONTRACT_ADDRESS"]!;

    @IsNotEmpty()
    public readonly BOT_PRIVATE_KEY: string = process.env["BOT_PRIVATE_KEY"]!;

    @IsNumberString()
    @IsNotEmpty()
    public readonly WEBSOCKET_PORT: string = process.env["WEBSOCKET_PORT"]!;


	public constructor() {}

	public validate(groups: string[] = []) {
		const validationErrors = validateSync(this, { groups });
		if (validationErrors.length > 0) throw validationErrors;
		return this;
	}
}
