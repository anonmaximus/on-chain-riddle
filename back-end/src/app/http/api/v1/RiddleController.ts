import { ERuleName } from "@prisma/client";
import ApiResponses from "#App/http/api/ApiResponses";
import RequireBodyValidation from "#App/http/middlewares/RequireBodyValidation";
import RequireJwtAuthentication, { HttpRequestContextAuth } from "#App/http/middlewares/RequireJwtAuthentication";
import RequireRules from "#App/http/middlewares/RequireRules";
import RiddleService from "#Services/RiddleService";
import WebSocketService from "#Services/WebSocketService";
import RiddleResponseResource from "common/resources/Riddle/RiddleResponseResource";
import RiddleStatsResponseResource from "common/resources/Riddle/RiddleStatsResponseResource";
import SubmitAnswerRequestResource from "common/resources/Riddle/SubmitAnswerRequestResource";
import SubmitAnswerResponseResource from "common/resources/Riddle/SubmitAnswerResponseResource";
import express, { Request, Response, Router } from "express";
import { container } from "tsyringe";

export default (superRouter: Router) => {
	const riddleService = container.resolve(RiddleService);

	const webSocketService = container.resolve(WebSocketService);

	const router = express.Router({ mergeParams: true });
	superRouter.use(`/riddles`, router);

	/**
	 * @description Get the current riddle
	 */
	router.get(`/current`, async (_req, res: Response<RiddleResponseResource>) => {
		try {
			const riddle = await riddleService.getCurrentRiddle();

			if (!riddle) {
				return ApiResponses.httpNotFound(res, "No active riddle found");
			}

			return ApiResponses.httpSuccess(
				res,
				RiddleResponseResource.hydrate<RiddleResponseResource>({
					id: riddle.id,
					question: riddle.question,
					isActive: riddle.isActive,
					solvedBy: riddle.solvedBy,
					solvedAt: riddle.solvedAt,
					createdAt: riddle.createdAt,
				}),
			);
		} catch (error) {
			return ApiResponses.httpInternalError(res, error);
		}
	});

	/**
	 * @description Get all riddles with pagination
	 */
	router.get(`/`, async (req: Request, res: Response<RiddleResponseResource[]>) => {
		try {
			const skip = parseInt(req.query["skip"] as string) || 0;
			const take = parseInt(req.query["take"] as string) || 10;

			const { riddles, total } = await riddleService.getAllRiddles(skip, take);

			res.setHeader("X-Total-Count", total.toString());

			return ApiResponses.httpSuccess(
				res,
				RiddleResponseResource.hydrateArray<RiddleResponseResource>(
					riddles.map((r) => ({
						id: r.id,
						question: r.question,
						isActive: r.isActive,
						solvedBy: r.solvedBy,
						solvedAt: r.solvedAt,
						createdAt: r.createdAt,
						answer: r.answer,
					})),
				),
			);
		} catch (error) {
			return ApiResponses.httpInternalError(res, error);
		}
	});

	/**
	 * @description Submits an answer to the current riddle
	 */
	router.post(
		`/submit-answer`,
		RequireJwtAuthentication(),
		RequireRules({ AND: { [ERuleName.submit_riddle_answer]: true } }),
		RequireBodyValidation(SubmitAnswerRequestResource),
		async (req: HttpRequestContextAuth, res: Response<SubmitAnswerResponseResource>) => {
			try {
				const userAddress = req.context!.authenticatedUser.address;
				const { transactionHash } = req.body as SubmitAnswerRequestResource;

				const { canSubmit, reason } = await riddleService.canUserSubmitAnswer(userAddress);

				if (!canSubmit) {
					return ApiResponses.httpBadRequest(res, reason || "Cannot submit answer");
				}

				webSocketService.notifySubmissionStatus(userAddress, "pending", {
					transactionHash,
					message: "Your answer is being processed on the blockchain...",
				});

				return ApiResponses.httpSuccess(
					res,
					SubmitAnswerResponseResource.hydrate<SubmitAnswerResponseResource>({
						success: true,
						message: "Your answer has been submitted. Check your wallet for the transaction status.",
						transactionHash,
					}),
				);
			} catch (error) {
				return ApiResponses.httpInternalError(res, error);
			}
		},
	);

	/**
	 * @description Get the list of riddles solved by the authenticated user
	 */
	router.get(`/my-solved`, RequireJwtAuthentication(), async (req: HttpRequestContextAuth, res: Response<RiddleResponseResource[]>) => {
		try {
			const userAddress = req.context!.authenticatedUser.address;
			const solvedRiddles = await riddleService.getUserSolvedRiddles(userAddress);

			return ApiResponses.httpSuccess(res, RiddleResponseResource.hydrateArray<RiddleResponseResource>(solvedRiddles));
		} catch (error) {
			return ApiResponses.httpInternalError(res, error);
		}
	});

	/**
	 * @description Get riddle statistics
	 */
	router.get(`/stats`, async (_req, res: Response<RiddleStatsResponseResource>) => {
		try {
			const stats = await riddleService.getStats();

			return ApiResponses.httpSuccess(res, RiddleStatsResponseResource.hydrate<RiddleStatsResponseResource>(stats));
		} catch (error) {
			return ApiResponses.httpInternalError(res, error);
		}
	});

	/**
	 * @description Verifies if the user can submit an answer to the current riddle
	 */
	router.get(`/can-submit`, RequireJwtAuthentication(), async (req: HttpRequestContextAuth, res) => {
		try {
			const userAddress = req.context!.authenticatedUser.address;
			const result = await riddleService.canUserSubmitAnswer(userAddress);

			return ApiResponses.httpSuccess(res, result);
		} catch (error) {
			return ApiResponses.httpInternalError(res, error);
		}
	});
};
