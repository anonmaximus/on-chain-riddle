import ApiResponses from "#App/http/api/ApiResponses";
import RequireEntityExistsBy from "#App/http/middlewares/RequireEntityExistsBy";
import RequireJwtAuthentication from "#App/http/middlewares/RequireJwtAuthentication";
import UserService from "#Services/UserService";
import UserResponseResource from "common/resources/User/UserResponseResource";
import express, { Request, Router } from "express";
import { container } from "tsyringe";

/**
 * @description This allow to declare all controllers used in the application
 */
export default (superRouter: Router) => {
	const userService = container.resolve(UserService);

	const privateRouter = express.Router({ mergeParams: true });
	superRouter.use(`/users`, RequireJwtAuthentication(), privateRouter);

	privateRouter.param(
		"id",
		RequireEntityExistsBy((id) => userService.existsBy({ id })),
	);

	// Then define dynamic parameter routes
	privateRouter.get(`/:id`, async (req: Request<{ id: string }>, res) => {
		const userId = req.params["id"];
		return userService.getById(userId).then((user) => ApiResponses.httpSuccess(res, UserResponseResource.hydrate<UserResponseResource>(user)));
	});
};
