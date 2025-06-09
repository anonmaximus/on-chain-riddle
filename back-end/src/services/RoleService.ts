import DbClient from "#Databases/DbClient";
import { singleton } from "tsyringe";
import { IsOptional } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { ERoleName, ERuleName, Prisma } from "@prisma/client";
import RoleServiceClassToken from "common/injectables/RoleServiceClassToken";

export class RoleQuery {
	@IsOptional()
	public include? = {};
	@IsOptional()
	public where? = {};
}

@singleton()
export default class RoleService implements RoleServiceClassToken {
	public constructor(protected dbClient: DbClient) {}

	public async getById(uid: string, query: RoleQuery = new RoleQuery()) {
		return this.dbClient.role.findUniqueOrThrow({
			...query,
			where: {
				id: uid,
			},
			include: {
				rules: true,
			},
		});
	}

	public async getAll() {
		return this.dbClient.role.findMany({
			include: {
				rules: true,
			},
		});
	}

	public async exists(id: string): Promise<boolean> {
		return !!(await this.dbClient.role.findUnique({
			select: { id: true },
			where: {
				id,
			},
		}));
	}

	public async existsBy(where: Prisma.RoleWhereUniqueInput): Promise<boolean> {
		return !!(await this.dbClient.role.findUnique({
			select: { id: true },
			where,
		}));
	}

	public async create(role: { name: ERoleName }, rules: { uid: string; name: ERuleName }[]) {
		return this.dbClient.role.create({
			data: {
				id: uuidv4(),
				name: role.name,
				rules: {
					connectOrCreate: rules?.map((rule) => ({
						where: {
							id: rule.uid,
						},
						create: {
							id: rule.uid,
							name: ERuleName[rule.name],
						},
					})),
				},
			},
		});
	}

	public async update(id: string, role: { name: ERoleName }) {
		return this.dbClient.role.update({
			where: {
				id,
			},
			data: {
				name: role.name,
			},
		});
	}
}
