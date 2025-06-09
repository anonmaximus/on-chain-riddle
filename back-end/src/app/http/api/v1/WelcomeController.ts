import express, { Router } from "express";
import ApiResponses from "#App/http/api/ApiResponses";

/**
 * @description This allow to declare all controllers used in the application
 */
export default (superRouter: Router) => {
	const router = express.Router({ mergeParams: true });
	superRouter.use(`/welcome`, router);

	/**
	 * @description Simple route to test if the api is working
	 */
	router.get(`/`, (_req, res) => {
		ApiResponses.httpSuccess(res, { value: "Welcome-api" });
	});
};
