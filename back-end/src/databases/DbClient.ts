import { container, singleton } from "tsyringe";
import { PrismaClient } from "@prisma/client";

@singleton()
export default class DbClient extends PrismaClient {
	public static async healthCheck() {
		const dbClient = container.resolve(DbClient);
		return dbClient.$queryRaw`SELECT 1`.catch((_err) => {
			throw new Error("HealtCheck: Please make sure your database server is running");
		});
	}
}
