import { singleton } from "tsyringe";
import ASeeder from "./ASeeder";
import { Variables } from "#Config/Variables";
import DbClient from "#Databases/DbClient";
import { ERuleName } from "@prisma/client";

@singleton()
export default class RulesUpsert extends ASeeder {
	public constructor(dbClient: DbClient, variables: Variables) {
		super(dbClient, variables);
	}
	public getUniqueName(): string {
		return "2025-13-02_RulesUpsert";
	}

	public getEnvironments(): Variables["APP_ENV"][] {
		return ["development", "staging", "production"];
	}

	/**
	 * @description Sets up rules in the database based on the predefined enum values of `ERuleName`.
	 *
	 * Steps:
	 * 1. Iterates over each entry in the `ERuleName` enum.
	 * 2. For each enum value, attempts to upsert a rule in the database.
	 *    - If a rule with the same name exists, updates it.
	 *    - If no rule with the same name exists, creates a new rule with the enum value as its name.
	 * 3. Resolves when all rules are set up or updated.
	 *
	 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
	 * @memberof ASeeder
	 */

	public async up(): Promise<void> {
		await Promise.all(
			Object.entries(ERuleName).map(async ([, value]) => {
				return this.dbClient.rule.upsert({
					where: {
						name: value,
					},
					update: {},
					create: {
						name: value,
					},
				});
			}),
		);
	}

	public async down() {}
}
