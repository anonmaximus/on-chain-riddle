import type Resource from "common/resources/Resource";
import ApiResponses from "#App/http/api/ApiResponses";
import { NextFunction, Request, Response } from "express";

export interface RequestBodyWithResource<T> extends Request {
	body: T;
}

/**
 * @description RequireValidation allow to validate a resource before to call the controller and inject the resource in the request.body
 * Request.body: T extends Resource
 */
export default function RequireBodyValidation<T extends Resource>(ResourceClass: new () => T, groups: string[] = []) {
	return async (request: RequestBodyWithResource<T>, response: Response, next: NextFunction) => {
		const resource = (ResourceClass as any as T & typeof Resource).hydrate<T>(request.body ?? ({} as T), { groups: [...groups] });
		return resource
			.validateOrReject({ groups: [...groups] })
			.then(() => (request.body = resource))
			.then(() => next())
			.catch((error) => {
				return ApiResponses.httpBadRequest(response, error);
			});
	};
}
