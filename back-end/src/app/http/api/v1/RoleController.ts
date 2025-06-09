import express, { Router, Response } from "express";
import { container } from "tsyringe";
import ApiResponses from "#App/http/api/ApiResponses";
import RoleResponseRessource from "common/resources/Role/RoleResponseRessource";
import RoleService from "#Services/RoleService";
import RequireEntityExistsBy from "#App/http/middlewares/RequireEntityExistsBy";
import OnParamsTypes from "#App/http/middlewares/OnParamsTypes";

/**
 * @description This allow to declare all controllers
 */
export default (superRouter: Router) => {
	const mainService = container.resolve(RoleService);

	const router = express.Router({ mergeParams: true });
	router.param(
		"id",
		RequireEntityExistsBy((id) => mainService.existsBy({ id })),
	);

	superRouter.use(`/roles`, router);

	/**
	 * @description Get one by id
	 */
	router.get<string, { id: string }>(`/:id`, OnParamsTypes({ id: "isUuid" }), async (req, res: Response<RoleResponseRessource>) => {
		return ApiResponses.httpSuccess(res, RoleResponseRessource.hydrate<RoleResponseRessource>(await mainService.getById(req.params.id)));
	});

	/**
	 * @description Get many
	 */
	router.get(`/`, async (_, res: Response<RoleResponseRessource[]>) => {
		return ApiResponses.httpSuccess(res, RoleResponseRessource.hydrateArray<RoleResponseRessource>(await mainService.getAll()));
	});
};
