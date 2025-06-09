import ApiResponses from "#App/http/api/ApiResponses";
import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import { ParsedQs } from "qs";

export interface RequestQueryWithResource<T> extends Request {
	query: T & ParsedQs;
}

/**
 * @description RequireValidation allow to validate a resource before to call the controller and inject the resource in the request.query
 * Request.query: T extends Resource
 */
export default function RequireQueryValidation<T extends ParsedQs>(ResourceClass: new () => T, groups: string[] = []) {
	return async (request: RequestQueryWithResource<T>, response: Response, next: NextFunction) => {
		const resource = plainToClass(ResourceClass, request.query, {
			groups: [...groups],
		});

		return validateOrReject(resource, { groups: [...groups] })
			.then(() => (request.query = resource))
			.then(() => next())
			.catch((errors) => ApiResponses.httpBadRequest(response, errors));
	};
}
