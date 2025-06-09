import "module-alias/register";
import "reflect-metadata";
import { container } from "tsyringe";
import logger from "#Services/Logger";
import seeders from "#Databases/seeders";
import { PrismaClient } from "@prisma/client";
import ASeeder from "#Databases/seeders/ASeeder";

/**
 * This script is used to seed the database with default values.
 * Make sure you build the project before running this script.
 */

logger.info("Make sure you build the project before running this script.");
const prisma = new PrismaClient();
container.register(PrismaClient, { useValue: prisma });

import "#Utils/diRegister";

if (process.argv.includes("down")) {
} else {
	(async () => {
		seeders
			.reduce<Promise<ASeeder | void | boolean>>((promise, seeder) => {
				return promise.then(async () => {
					if (!(await seeder?.canUp())) return false;
					return seeder
						?.setUp()
						.then(() => seeder.up())
						.then(() => seeder.done())
						.catch((e) => seeder.fail().then(() => Promise.reject(e)));
				});
			}, Promise.resolve())
			.then(() => logger.info("Database seeded successfully"))
			.then(() => prisma.$disconnect())
			.then(() => process.exit(0))
			.catch((e) => {
				logger.error(e);
				prisma.$disconnect().finally(() => process.exit(1));
			});
	})();
}
