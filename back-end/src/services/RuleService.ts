import DbClient from "#Databases/DbClient";
import { singleton } from "tsyringe";
import { IsOptional } from "class-validator";
import RuleServiceClassToken from "common/injectables/RuleServiceClassToken";

export class RuleQuery {
	@IsOptional()
	public select? = {};
	@IsOptional()
	public include? = {};
	@IsOptional()
	public where? = {};
}

@singleton()
export default class RuleService implements RuleServiceClassToken {
	public constructor(protected dbClient: DbClient) {}

	public async exists(id: string): Promise<boolean> {
		return !!(await this.dbClient.rule.findUnique({
			select: { id: true },
			where: {
				id,
			},
		}));
	}
}
