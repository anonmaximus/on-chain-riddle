import { ERuleName } from "@prisma/client";
import ApiResponses from "#App/http/api/ApiResponses";
import assert from "assert";
import UserJwtResource from "common/resources/User/UserJwtResource";
import { NextFunction, Response } from "express";

import { HttpRequestContextAuth } from "./RequireJwtAuthentication";

type IRequiredRules =
	| {
			AND: { [key in ERuleName]?: boolean };
			OR?: { [key in ERuleName]?: boolean };
	  }
	| {
			AND?: { [key in ERuleName]?: boolean };
			OR: { [key in ERuleName]?: boolean };
	  };

/**
 * @description That check if user has the rights, if not, it will return a 401
 * If no rules provided, that means it's closed
 */
export default function RequireRules(requiredRules: IRequiredRules) {
	return async (request: HttpRequestContextAuth, response: Response, next: NextFunction) => {
		assert(request.context?.authenticatedUser, "authenticatedUser is not defined");

		const hasRight = checkRights(request.context.authenticatedUser, requiredRules);

		if (!hasRight) return ApiResponses.httpUnauthorized(response);

		return next();
	};
}

/**
 * @description That check if user has the rights, if not, it will return false
 */
function checkRights(user: UserJwtResource, requiredRules: IRequiredRules): boolean {
	const userRules = user.role.rules.reduce<Record<string, boolean>>((acc, rule) => {
		acc[rule.name] = true;
		return acc;
	}, {});

	/**
	 * If AND is TRUE && (OR is TRUE || (OR is NOT DEFINED)) we return true
	 */

	/**
	 * Every rules in AND and OR must be
	 *
	 * If value is false and no rule match, the result is true
	 * If value is true and no rule match, the result is false
	 *
	 * If value is true and rule match, the result is true
	 * If value is false and rule match, the result is false
	 */

	const AND = (() => {
		const entries = Object.entries(requiredRules.AND || {});

		if (entries.length) {
			for (const [key, value] of entries) {
				if (value === true && userRules[key]) continue;
				if (value === false && userRules[key] === undefined) continue;

				return false;
			}

			return true;
		}

		return null;
	})();

	const OR = (() => {
		const entries = Object.entries(requiredRules.OR || {});

		if (entries.length) {
			for (const [key, value] of entries) {
				if (value === true && userRules[key]) return true;
				if (value === false && userRules[key] === undefined) return true;
			}

			return false;
		}

		return null;
	})();

	if (AND === null && OR === null) return false;
	return (AND === true || AND === null) && (OR === true || OR === null);
}
