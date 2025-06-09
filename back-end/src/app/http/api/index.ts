import express, { Router } from "express";
import v1Controllers from "./v1";
import { container } from "tsyringe";
import Config from "#Config/index";
import PaginationBuilder from "../middlewares/PaginationBuilder";

const config = container.resolve(Config);

/**
 * @description This allow to declare all controllers used in the application
 */
export default (superRouter: Router) => {
	const router = express.Router();
	superRouter.use(config.APP_ROUTINGS.API_URL, PaginationBuilder(), router);
	v1Controllers(router);
};
