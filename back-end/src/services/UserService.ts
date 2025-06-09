import { ERoleName, Prisma } from "@prisma/client";
import DbClient from "#Databases/DbClient";
import UserServiceClassToken from "common/injectables/UserServiceClassToken";
import UserJwtResource from "common/resources/User/UserJwtResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import { singleton } from "tsyringe";
import nacl from "tweetnacl";

import AuthService from "./AuthService";

@singleton()
export default class UserService implements UserServiceClassToken {
	public constructor(
		private dbClient: DbClient,
		private authService: AuthService,
	) {}

	public async exists(id: string): Promise<boolean> {
		return !!(await this.dbClient.user.findUnique({
			select: { id: true },
			where: {
				id,
			},
		}));
	}

	public async existsBy(where: Prisma.UserWhereUniqueInput): Promise<boolean> {
		return !!(await this.dbClient.user.findUnique({
			select: { id: true },
			where,
		}));
	}

	public async getById(id: string) {
		const user = await this.dbClient.user.findUniqueOrThrow({
			where: {
				id,
			},
			include: {
				role: {
					include: {
						rules: true,
					},
				},
			},
		});
		return user;
	}

	public async getByAddress(address: string) {
		return this.dbClient.user.findUnique({
			where: {
				address,
			},
			include: {
				role: {
					include: {
						rules: true,
					},
				},
				challenge: true,
			},
		});
	}

	public async getOrCreateUser(address: string) {
		const user = await this.dbClient.user.findUnique({
			where: {
				address,
			},
		});

		if (user) return user;

		return this.dbClient.user.create({
			data: {
				address,
				role: {
					connect: {
						name: ERoleName.restricted,
					},
				},
			},
		});
	}

	public async signIn(userResource: UserSignInRequestResource) {
		const bs58Module = await import("bs58");
		const bs58 = bs58Module.default;

		const user = await this.getByAddress(userResource.address);

		if (!user) throw new Error("User not found");

		if (!user.challenge) throw new Error("Challenge not found");

		const message = `Sign this message to authenticate: ${user.challenge.nonce}`;
		const messageUint8 = new TextEncoder().encode(message);

		let signatureUint8;
		try {
			signatureUint8 = bs58.decode(userResource.signature);
		} catch (e) {
			throw new Error("Invalid signature format");
		}

		let publicKeyUint8;
		try {
			publicKeyUint8 = bs58.decode(userResource.address);
		} catch (e) {
			throw new Error("Invalid public key format");
		}

		const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
		if (!isValid) throw new Error("Invalid signature");

		const userWithUpdatedRole = await this.dbClient.user.update({
			where: {
				id: user.id,
			},
			data: {
				loginAt: new Date(),
				role: {
					connect: {
						name: ERoleName.signed,
					},
				},
			},
			include: {
				role: {
					include: {
						rules: true,
					},
				},
			},
		});

		return this.authService.generateJwtPair({
			user: UserJwtResource.hydrate<UserJwtResource>(userWithUpdatedRole),
		});
	}
}
