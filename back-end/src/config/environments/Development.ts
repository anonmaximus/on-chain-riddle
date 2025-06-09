import logger from "#Services/Logger";

import ConfigBase from "./ConfigBase";

export default class Development extends ConfigBase {
	public constructor() {
		super();
		logger.info("Used configuration: Development");
	}

	public readonly APP_ROUTINGS = {
		BASE_URL: "/",
		API_URL: "/api",
	};

	public readonly CROSS_DOMAIN_ORIGIN = "http://localhost:3002,http://localhost:3000";

	public readonly JWT = {
		ACCESS_TOKEN_EXPIRATION: "30m",
		REFRESH_TOKEN_EXPIRATION: "24h",
		COOKIE_EXPIRATION: 1000 * 60 * 60 * 48,
	};

	public readonly BASIC_AUTH = {
		ENABLED: false,
		USERS: {
			visitor: "visitor",
		},
	};

	public readonly PAGINATED_DEFAULT_VALUE: number = 100;

	public readonly CRON_CONFIG = {
		TEST_JOB: "*/5 * * * * *",
	};
}
