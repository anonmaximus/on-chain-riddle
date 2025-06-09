import Config from "#Config/index";
import { Variables } from "#Config/Variables";
import UserJwtResource from "common/resources/User/UserJwtResource";
import jwt, { SignOptions, VerifyCallback } from "jsonwebtoken";
import { singleton } from "tsyringe";

export type IJwtPair = {
	accessToken: string;
	refreshToken: string;
};

export type IJwtContent = {
	user: UserJwtResource;
};

@singleton()
export default class AuthService {
	private readonly accesTokenSecret: string;
	private readonly refreshTokenSecret: string;
	private readonly accessTokenExpirationTime: SignOptions["expiresIn"];
	private readonly refreshTokenExpirationTime: SignOptions["expiresIn"];

	public constructor(variables: Variables, config: Config) {
		this.accesTokenSecret = variables.ACCESS_TOKEN_SECRET;
		this.refreshTokenSecret = variables.REFRESH_TOKEN_SECRET;
		this.accessTokenExpirationTime = config.JWT.ACCESS_TOKEN_EXPIRATION as SignOptions["expiresIn"];
		this.refreshTokenExpirationTime = config.JWT.REFRESH_TOKEN_EXPIRATION as SignOptions["expiresIn"];
	}

	public generateJwtPair(jwtContent: IJwtContent) {
		return {
			accessToken: this.generateAccessToken(jwtContent),
			refreshToken: this.generateRefreshToken(jwtContent),
		};
	}

	/**
	 * @throws TokenExpiredError
	 */
	public verifyAccessToken(token: string, callback?: VerifyCallback): void {
		jwt.verify(token, this.accesTokenSecret, callback);
	}

	/**
	 * @throws TokenExpiredError
	 */
	public verifyRefreshToken(token: string, callback?: VerifyCallback): void {
		jwt.verify(token, this.refreshTokenSecret, callback);
	}

	public decodeAccessToken(token: string) {
		return jwt.decode(token);
	}
	
	/**
	 * Validates an access token and returns the user contained in it
	 * @param token JWT access token to validate
	 * @returns The user contained in the token or null if token is invalid
	 */
	public validateToken(token: string): UserJwtResource | null {
		try {
			// Verify the token's signature and expiration
			this.verifyAccessToken(token);
			
			// Decode the token
			const decoded = this.decodeAccessToken(token);
			
			if (!decoded || typeof decoded === 'string') {
				return null;
			}
			
			// Extract and hydrate the user from the token
			const user = UserJwtResource.hydrate<UserJwtResource>(decoded["user"]);
			return user;
		} catch (error) {
			// Invalid token or other error
			return null;
		}
	}

	private generateAccessToken(jwtContent: IJwtContent): string {
		return jwt.sign({ ...jwtContent }, this.accesTokenSecret, {
			expiresIn: this.accessTokenExpirationTime,
		});
	}

	private generateRefreshToken(jwtContent: IJwtContent): string {
		return jwt.sign({ ...jwtContent }, this.refreshTokenSecret, {
			expiresIn: this.refreshTokenExpirationTime,
		});
	}
}
