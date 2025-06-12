import { ERoleName, Prisma } from "@prisma/client";
import DbClient from "#Databases/DbClient";
import UserServiceClassToken from "common/injectables/UserServiceClassToken";
import UserJwtResource from "common/resources/User/UserJwtResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import { ethers } from "ethers";
import { singleton } from "tsyringe";

import AuthService from "./AuthService";
import logger from "./Logger";

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
				address: address.toLowerCase(), // Ethereum addresses en minuscules
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
		const normalizedAddress = address.toLowerCase();

		const user = await this.dbClient.user.findUnique({
			where: {
				address: normalizedAddress,
			},
		});

		if (user) return user;

		return this.dbClient.user.create({
			data: {
				address: normalizedAddress,
				role: {
					connect: {
						name: ERoleName.restricted,
					},
				},
			},
		});
	}

	public async signIn(userResource: UserSignInRequestResource) {
		const normalizedAddress = this.normalizeAddress(userResource.address);

		const user = await this.getByAddress(normalizedAddress);

		if (!user) {
			logger.debug("Sign in failed: User not found");
			throw new Error("User not found");
		}

		if (!user.challenge) {
			logger.debug("Sign in failed: No challenge found for user", { userId: user.id });
			throw new Error("Challenge not found");
		}

		const message = `Sign this message to authenticate: ${user.challenge.nonce}`;
		const recoveredAddress = ethers.verifyMessage(message, userResource.signature);

		if (recoveredAddress.toLowerCase() !== normalizedAddress) {
			logger.debug("Sign in failed: Invalid signature - address mismatch", {
				recoveredAddress: recoveredAddress.toLowerCase(),
				expectedAddress: normalizedAddress,
			});
			throw new Error("Invalid signature: address mismatch");
		}
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
		const jwtPair = await this.authService.generateJwtPair({
			user: UserJwtResource.hydrate<UserJwtResource>(userWithUpdatedRole),
		});

		return jwtPair;
	}

	private normalizeAddress(address: string): string {
		if (!ethers.isAddress(address)) {
			throw new Error("Invalid Ethereum address format");
		}
		return ethers.getAddress(address).toLowerCase(); // Checksum puis minuscules
	}
}
