import "module-alias/register";
import "reflect-metadata";

import { container } from "tsyringe";
import { Variables } from "#Config/Variables";
import logger from "#Services/Logger";

import Crons from "#App/crons/index";
import http from "http";

const variables = container.resolve(Variables);
try {
	variables.validate();
} catch (error) {
	logger.error(error);
	process.exit(1);
}

import "#Utils/diRegister";

const port = variables.APP_ENV === "development" ? variables.DEV_CRON_PORT : variables.APP_PORT;

(() => {
	try {
		const server = http.createServer(function (_req, res) {
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.write("Health Check: OK");
			res.end();
		});
		server.listen(port).on("listening", () => {
			console.table(
				[
					{
						"Entry label": "CRON Service",
						Port: port,
						"Root url": "/",
					},
				],
				["Entry label", "Port", "Root url"],
			);
		});
		server.on("error", (err) => {
			logger.error(err);
			process.exit(1);
		});
		Crons.start();
	} catch (e) {
		logger.error(e);
		process.exit(1);
	}
})();
