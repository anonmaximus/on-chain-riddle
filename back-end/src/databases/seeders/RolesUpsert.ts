import { ERoleName, ERuleName } from "@prisma/client";
import { Variables } from "#Config/Variables";
import DbClient from "#Databases/DbClient";
import { singleton } from "tsyringe";

import ASeeder from "./ASeeder";

@singleton()
export default class RolesUpsert extends ASeeder {
	public constructor(dbClient: DbClient, variables: Variables) {
		super(dbClient, variables);
	}

	public getUniqueName(): string {
		return "2025-13-02_RolesUpsert";
	}

	public getEnvironments(): Variables["APP_ENV"][] {
		return ["development", "staging", "production"];
	}
	/**
	 * @description Sets up roles in the database with associated rules based on predefined sets of rules for different roles.
	 *
	 * @returns {Promise<void>}
	 * @memberof ASeeder
	 */
	public async up(): Promise<void> {
		await this.dbClient.rule.findMany().then((rules) => {
			const signedUserRules: ERuleName[] = [ERuleName.submit_riddle_answer];
			return this.dbClient.role.upsert({
				where: {
					name: ERoleName.signed,
				},
				create: {
					name: ERoleName.signed,
					rules: {
						connect: rules.filter((rule) => signedUserRules.includes(rule.name)),
					},
				},
				update: {
					rules: {
						connect: rules,
					},
				},
			});
		});

		await this.dbClient.role.upsert({
			where: {
				name: ERoleName.restricted,
			},
			create: {
				name: ERoleName.restricted,
			},
			update: {},
		});
	}

	public async down(): Promise<void> {}
}
