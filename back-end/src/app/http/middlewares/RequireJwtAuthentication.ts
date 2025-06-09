import ApiResponses from "#App/http/api/ApiResponses";
import AuthService from "#Services/AuthService";
import logger from "#Services/Logger";
import UserService from "#Services/UserService";
import assert from "assert";
import JwtPairResource from "common/resources/Auth/JwtPairResource";
import UserJwtResource from "common/resources/User/UserJwtResource";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import * as P from "ts-pattern";
import { container } from "tsyringe";

export type TContextAuth = {
	authenticatedUser: UserJwtResource;
};

export interface HttpRequestContextAuth extends Request {
	context?: TContextAuth;
}

type IHandleTokenResponse =
	| {
			status: "NO_TOKEN" | "EMPTY_JWT_PAIR" | "UNSUPPORTED_TOKEN_AS_STRING" | "EXPIRED_REFRESH_TOKEN";
			value: null;
	  }
	| {
			status: "AUTHENTICATED" | "AUTHENTICATED_AFTER_REFRESH";
			value: UserJwtResource;
	  };

const authService = container.resolve(AuthService);
const userService = container.resolve(UserService);

/**
 * @description Returns the request context with an authenticated user
 */
export function requireJwtAuthenticationContext(request: Request): TContextAuth {
	assert(request.context?.authenticatedUser, new Error("Jwt Authentication middleware is required"));
	return request.context;
}

/**
 * @description Options for the cookie that contains the JWT pair
 */
export const cookieJwtOptions: () => Readonly<CookieOptions> = () => {
	return {
		httpOnly: false,
		path: "/",
		secure: true,
		sameSite: "none",
		expires: new Date(Date.now() + 1000 * 60 * 60 * 12), // 48h
	};
};
/**
 * @description Middleware that checks if the user is authenticated by JWT
 */
export default function RequireJwtAuthentication() {
	return async (request: HttpRequestContextAuth, response: Response, next: NextFunction) => {
		return P.match(await handleToken(request, response))
			.with(
				{
					status: "EMPTY_JWT_PAIR",
				},
				{ status: "NO_TOKEN" },
				{ status: "UNSUPPORTED_TOKEN_AS_STRING" },
				{ status: "EXPIRED_REFRESH_TOKEN" },
				() => ApiResponses.httpForbidden(response),
			)
			.with(
				{ status: "AUTHENTICATED" },
				{ status: "AUTHENTICATED_AFTER_REFRESH" },
				({ value }) => ((request.context = { ...request.context, authenticatedUser: value }), next()),
			)
			.exhaustive();
	};
}

/**
 * @description Verifies the JWT pair and returns the authenticated user
 *  	three cases :
 * 				- The access token is valid: returns the authenticated user
 * 				- The access token is expired: generates a new JWT pair from refresh token and returns the authenticated user
 * 				- Otherwise, returns null
 */
async function handleToken(request: HttpRequestContextAuth, response: Response): Promise<IHandleTokenResponse> {
	const jwtPairString = (request.cookies["jwtPair"] ?? "").trim();
	if (!jwtPairString) return { status: "EMPTY_JWT_PAIR", value: null };

	try {
		// Create JwtPairResource from jwtPairString of cookie
		const jwtPair = JwtPairResource.hydrate<JwtPairResource>(JSON.parse(jwtPairString));

		// Decode the access token
		const token = authService.decodeAccessToken(jwtPair.accessToken);

		if (!token) return { status: "NO_TOKEN", value: null };

		if (typeof token === "string") return { status: "UNSUPPORTED_TOKEN_AS_STRING", value: null };

		const user = UserJwtResource.hydrate<UserJwtResource>(token["user"]);

		// We check if the user is active
		userService.getById(user.id).catch((e) => {
			logger.warn(e, "Jwt Cookie will be deleted");
			response.clearCookie("jwtPair");
			return { status: "ACCOUNT_NOT_ACTIVE", value: null };
		});

		try {
			// Verify the access token
			authService.verifyAccessToken(jwtPair.accessToken);
			// Create UserJwtResponseResource from token
			return {
				status: "AUTHENTICATED",
				value: UserJwtResource.hydrate<UserJwtResource>(token["user"]),
			};
		} catch (error) {
			// When the access token is expired, we try to generate a new JWT pair and return the authenticated user
			if (!(error instanceof TokenExpiredError)) throw error;

			authService.verifyRefreshToken(jwtPair.refreshToken);

			// We get a fresh user entity
			return userService
				.getById(user.id)
				.then((userEntity) => UserJwtResource.hydrate<UserJwtResource>(userEntity))
				.then((userJwtResource) => authService.generateJwtPair({ user: userJwtResource }))
				.then((jwtPair) => JSON.stringify(JwtPairResource.hydrate<JwtPairResource>(jwtPair)))
				.then((jwtPairString) => response.cookie("jwtPair", jwtPairString, cookieJwtOptions()))
				.then(() => ({ status: "AUTHENTICATED_AFTER_REFRESH", value: user }) as const)
				.catch((e) => {
					logger.warn(e, "Jwt Cookie will be deleted");
					response.clearCookie("jwtPair");
					return { status: "EXPIRED_REFRESH_TOKEN", value: null };
				});
		}
	} catch (error) {
		logger.warn(error);
		response.clearCookie("jwtPair");
		// For any other error, we return null, that means the user is not authenticated
		return { status: "NO_TOKEN", value: null };
	}
}
