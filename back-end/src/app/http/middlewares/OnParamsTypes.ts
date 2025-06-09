import { NextFunction, Request, Response } from "express";
import * as P from "ts-pattern";
import { validate, version } from "uuid";
import { isEmail, isNumber, isString } from "class-validator";

type TParamsTypes = "isUuid" | "isEmail" | "isNumber" | "isString";

/**
 * @description This middleware allow to check if the params have the right type
 */
export default function OnParamsTypes(params: { [key: string]: TParamsTypes }) {
	return async (request: Request, _response: Response, next: NextFunction) => {
		for (const [key, type] of Object.entries(params)) {
			const value = request.params[key];
			if (!value) return void next("route");

			const matched: boolean = P.match(type)
				.with("isUuid", () => isUuidV4(value))
				.with("isEmail", () => isEmail(value))
				.with("isNumber", () => isNumber(value))
				.with("isString", () => isString(value))
				.exhaustive();

			if (!matched) return void next("route");
		}
		next();
	};
}

function isUuidV4(value: string): boolean {
	return validate(value) && version(value) === 4;
}
