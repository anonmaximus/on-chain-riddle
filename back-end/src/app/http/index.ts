import { Router } from "express";
import apiControllers from "./api";

/**
 * @description This allow to declare all controllers used in the application
 */
export default (superRouter: Router) => {
	apiControllers(superRouter);
};
