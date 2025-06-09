import HttpException from "#App/http/exceptions/HttpException";
import { Variables } from "#Config/Variables";
import { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import ApiResponses from "../api/ApiResponses";
import * as P from "ts-pattern";
import logger from "#Services/Logger";

const variables = container.resolve(Variables);

export default function errorHandler(error: any, _req: Request, response: Response, _next: NextFunction) {
	logger.error(error);
	return void P.match(error)
		.when(
			(error) => error instanceof HttpException,
			() => response.status(error.httpCode).send(error.message),
		)
		.when(
			(error) => error instanceof SyntaxError,
			() => ApiResponses.httpMalformedRequest(response, error.message),
		)
		.when(
			(error) => error instanceof Error && variables.APP_ENV === "production",
			() => {
				// @TODO Add logger to log on Sentry more information about the error
				return ApiResponses.httpInternalError(response);
			},
		)
		.when(
			(error) => error instanceof Error,
			() => {
				return ApiResponses.httpInternalError(response, error);
			},
		)
		.when(
			(_error) => variables.APP_ENV === "production",
			() => {
				// @TODO Add logger to log on Sentry more information about the error
				return ApiResponses.httpInternalError(response);
			},
		)
		.otherwise((error) => {
			return ApiResponses.httpInternalError(response, error);
		});
}
