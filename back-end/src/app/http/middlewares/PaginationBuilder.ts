import { NextFunction, Request, Response } from "express";
import ApiResponses from "../api/ApiResponses";
import { plainToClass, Type, Transform } from "class-transformer";
import { IsInt, IsOptional, Min, validateOrReject } from "class-validator";
import { container } from "tsyringe";
import Config from "#Config/index";

const config = container.resolve(Config);

export class Pagination {
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => value ?? config.PAGINATED_DEFAULT_VALUE)
	@Type(() => Number)
	public take: number = config.PAGINATED_DEFAULT_VALUE;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Transform(({ value }) => value ?? 0)
	@Type(() => Number)
	public skip: number = 0;
}

/**
 * @description RequireValidation allow to validate a resource before to call the controller and inject the resource in the request.body
 * Request.body: T extends Resource
 */
export default function PaginationBuilder() {
	return async (request: Request, response: Response, next: NextFunction) => {
		if (!("_take" in request.query) && !("_skip" in request.query)) return next();

		const pagination = plainToClass(Pagination, {
			take: request.query["_take"],
			skip: request.query["_skip"],
		});

		await validateOrReject(pagination)
			.then(() => (request.body = pagination))
			.then(() => next())
			.catch((error) => {
				return ApiResponses.httpBadRequest(response, error);
			});
	};
}
