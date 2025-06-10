import express, { Router } from "express";

import AuthController from "./AuthController";
import RoleController from "./RoleController";
import UserController from "./UserController";
import WelcomeController from "./WelcomeController";
import RiddleController from "./RiddleController";

export default (superRouter: Router) => {
	const router = express.Router();
	superRouter.use(`/v1`, router);

	WelcomeController(router);
	AuthController(router);
	RoleController(router);
	UserController(router);
	RiddleController(router);
};
