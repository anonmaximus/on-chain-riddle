
import DbClient from "#Databases/DbClient";
import crypto from "crypto";
import { singleton } from "tsyringe";

@singleton()
export default class ChallengeService {
	public constructor(private dbClient: DbClient) {}

	public async upsertChallenge(userId: string) {
		const nonce = crypto.randomBytes(16).toString("hex");

		const data = {
			nonce,
			userId,
		};

		const challenge = await this.dbClient.challenge.upsert({
			where: { userId },
			create: data,
			update: data,
		});
		return challenge;
	}
}
