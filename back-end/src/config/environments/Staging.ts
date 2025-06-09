import logger from "#Services/Logger";

import ConfigBase from "./ConfigBase";

export default class Staging extends ConfigBase {
	public constructor() {
		super();
		logger.info("Used configuration: Staging");
	}

	public readonly APP_ROUTINGS = {
		BASE_URL: "/",
		API_URL: "/api",
	};

	public readonly CROSS_DOMAIN_ORIGIN: string = "";

	public readonly JWT = {
		ACCESS_TOKEN_EXPIRATION: "30m",
		REFRESH_TOKEN_EXPIRATION: "24h",
		COOKIE_EXPIRATION: 1000 * 60 * 60 * 48,
	};

	public readonly BASIC_AUTH = {
		ENABLED: true,
		USERS: {
			visitor: "visitor",
		},
	};

	public readonly PAGINATED_DEFAULT_VALUE: number = 100;

	public readonly CRON_CONFIG = {
		TEST_JOB: "*/5 * * * * *",
	};
}
