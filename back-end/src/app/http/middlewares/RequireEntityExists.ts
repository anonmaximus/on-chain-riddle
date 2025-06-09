import ApiResponses from "#App/http/api/ApiResponses";
import { NextFunction, Request, Response } from "express";
import { InjectionToken, container } from "tsyringe";
import * as P from "ts-pattern";

interface IEntityExists {
	exists(id: string): Promise<boolean>;
}

export default function RequireEntityExists<T>(EntityService: InjectionToken<T & IEntityExists>) {
	const entityService = container.resolve(EntityService);
	return async (_request: Request, response: Response, next: NextFunction, value: string) => {
		P.match(await entityService.exists(value))
			.with(false, () => ApiResponses.httpNotFound(response))
			.otherwise(() => next());
	};
}
