import { Variables } from "#Config/Variables";
import DbClient from "#Databases/DbClient";
import logger from "#Services/Logger";

export default abstract class ASeeder {
	constructor(
		protected dbClient: DbClient,
		protected variables: Variables,
	) {}
	abstract getUniqueName(): string;
	abstract getEnvironments(): Variables["APP_ENV"][];
	abstract up(): Promise<void>;
	abstract down(): Promise<void>;

	/**
	 * @description canUp method is used to check if the seeder can be run in the current environment
	 * @returns {Promise<boolean>}
	 * @memberof ASeeder
	 */

	public async canUp(): Promise<boolean> {
		if (!this.getEnvironments().includes(this.variables.APP_ENV)) return false;
		const seederEntity = await this.dbClient.seeder.findUnique({
			where: { name: this.getUniqueName() },
		});
		if (!seederEntity) return true;
		if (seederEntity.status !== "error") return false;

		return true;
	}

	/**
	 * @description setUp method is used to create or update the seeder status to pending before running the up method
	 * @returns {Promise<boolean>}
	 * @memberof ASeeder
	 */

	public async setUp(): Promise<boolean> {
		await this.dbClient.seeder.upsert({
			where: {
				name: this.getUniqueName(),
			},
			update: {
				status: "pending",
			},
			create: {
				name: this.getUniqueName(),
				status: "pending",
			},
		});
		return true;
	}

	/**
	 * @description done method is used to update the seeder status to success after running the up method
	 * @returns {Promise<void>}
	 * @memberof ASeeder
	 */
	public async done(): Promise<void> {
		await this.dbClient.seeder.update({
			where: {
				name: this.getUniqueName(),
			},
			data: {
				status: "success",
			},
		});
		logger.info(`Seeder ${this.getUniqueName()} done`);
	}

	/**
	 * @description fail method is used to update the seeder status to error after running the up method
	 * @returns {Promise<void>}
	 * @memberof ASeeder
	 */
	public async fail(): Promise<void> {
		await this.dbClient.seeder.update({
			where: {
				name: this.getUniqueName(),
			},
			data: {
				status: "error",
			},
		});
		logger.error(`Seeder ${this.getUniqueName()} failed`);
	}
}
