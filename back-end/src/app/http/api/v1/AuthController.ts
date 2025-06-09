import RequireBodyValidation from "#App/http/middlewares/RequireBodyValidation";
import { cookieJwtOptions } from "#App/http/middlewares/RequireJwtAuthentication";
import ChallengeService from "#Services/ChallengeService";
import UserService from "#Services/UserService";
import JwtPairResource from "common/resources/Auth/JwtPairResource";
import UserPreSignRequestResource from "common/resources/User/UserPreSignRequestResource";
import UserPreSignResponseResource from "common/resources/User/UserPreSignResponseResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import express, { Router } from "express";
import { container } from "tsyringe";

import ApiResponses from "../ApiResponses";

export default (superRouter: Router) => {
	const router = express.Router();
	superRouter.use(`/auth`, router);

	const userService = container.resolve(UserService);
	const challengeService = container.resolve(ChallengeService); // AuthService

	router.post("/pre-sign", RequireBodyValidation(UserPreSignRequestResource), async (req, res) => {
		const { address } = req.body;
		const user = await userService.getOrCreateUser(address);
		const challenge = await challengeService.upsertChallenge(user.id);

		return ApiResponses.httpSuccess(
			res,
			UserPreSignResponseResource.hydrate<UserPreSignResponseResource>({
				id: user.id,
				address: user.address,
				messageToSign: `Sign this message to authenticate: ${challenge.nonce}`,
			}),
		);
	});

	router.post("/sign-in", RequireBodyValidation(UserSignInRequestResource), async (req, res) => {
		return userService
			.signIn(req.body)
			.then((jwtPair) => {
				const jwtPairResource = JwtPairResource.hydrate<JwtPairResource>(jwtPair);
				res.cookie("jwtPair", JSON.stringify(jwtPairResource), cookieJwtOptions());
				return ApiResponses.httpSuccess(res, jwtPairResource);
			})
			.catch((err) => ApiResponses.httpUnauthorized(res, err));
	});

	router.post("/logout", async (_req, res) => {
		return res.clearCookie("jwtPair"), ApiResponses.httpNoContent(res);
	});
};
