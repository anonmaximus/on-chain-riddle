import "module-alias/register";
import "reflect-metadata";

import { Variables } from "#Config/Variables";
import logger from "#Services/Logger";
import { container } from "tsyringe";

const variables = container.resolve(Variables);
try {
	variables.validate();
} catch (error) {
	logger.error(error);
	process.exit(1);
}

import "#Utils/diRegister";

import routes from "#App/http/api";
import cors from "cors";
import bodyParser from "body-parser";

import errorHandler from "#App/http/middlewares/ErrorHandler";

import express, { Express, Router } from "express";
import cookiesParser from "cookie-parser";
import basicAuth from "express-basic-auth";
import path from "path";
import Config from "#Config/index";
import DbClient from "#Databases/DbClient";
import proxy from "express-http-proxy";
import http from "http";

(async () => {
	const config = container.resolve(Config);
	const port = variables.APP_PORT;
	const rootUrl = config.APP_ROUTINGS.BASE_URL;
	const publicDir = path.join(__dirname, "../", "public");

	await DbClient.healthCheck();

	const router: Express = express();
	router.disable("X-Powered-By");

	config.BASIC_AUTH.ENABLED &&
		router.use(
			basicAuth({
				users: config.BASIC_AUTH.USERS,
				challenge: true,
			}),
		);

	config.CROSS_DOMAIN_ORIGIN.trim() &&
		router.use(
			cors({
				origin: config.CROSS_DOMAIN_ORIGIN.split(",").map((o) => o.trim()),
				methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
				credentials: true,
			}),
		);

	router.use(express.json(), cookiesParser(), bodyParser.urlencoded({ extended: true }), bodyParser.json());

	const subRouter: Router = express.Router();

	router.use(rootUrl, subRouter);
	router.use(errorHandler);
	routes(subRouter);

	router.use("/", proxy(`${variables.NEXTJS_HOST}:${variables.NEXTJS_PORT}`));
	//router.use(express.static(publicDir));
	const regexAPI = new RegExp(`^(?!${config.APP_ROUTINGS.API_URL}).+`);
	router.get(regexAPI, (_req, res) => {
		res.sendFile(path.join(publicDir, "index.html"));
	});

	// Create HTTP server for both Express
	const server = http.createServer(router);

	// Start HTTP server
	server.listen(port, () => {
		console.table(
			[
				{
					"Entry label": "API Service",
					Port: port,
					host: "external",
					"Root url": config.APP_ROUTINGS.API_URL,
				},
				{
					"Entry label": "NextJs Service",
					Port: variables.NEXTJS_PORT,
					host: variables.NEXTJS_HOST,
					"Root url": "/",
				},
			],
			["Entry label", "Port", "host", "Root url"],
		);
	});

	// Handle graceful shutdown
	const shutdown = async () => {
		logger.info("Shutting down server...");
		server.close(() => {
			logger.info("Server shut down");
			process.exit(0);
		});
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
})().catch((error) => {
	logger.error(error);
	process.exit(1);
});
