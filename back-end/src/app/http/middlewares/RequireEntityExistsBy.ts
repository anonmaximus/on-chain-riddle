import ApiResponses from "#App/http/api/ApiResponses";
import { NextFunction, Request, Response } from "express";
import { HttpRequestContextAuth } from "./RequireJwtAuthentication";

export default function RequireEntityExistsBy<_T>(existCallback: (value: string, userId?: string) => Promise<boolean>) {
	return async (request: Request, response: Response, next: NextFunction, value: string): Promise<void> => {
		const userId = (request as HttpRequestContextAuth).context?.authenticatedUser.id;
		(await existCallback(value, userId)) ? next() : ApiResponses.httpNotFound(response);
	};
}
