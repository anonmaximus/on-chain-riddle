import logger from "#Services/Logger";

import ConfigBase from "./ConfigBase";

export default class Production extends ConfigBase {
	public constructor() {
		super();
		logger.info("Used configuration: Production");
	}

	public readonly APP_ROUTINGS = {
		BASE_URL: "/",
		API_URL: "/api",
	};

	public readonly CROSS_DOMAIN_ORIGIN: string = "";

	public readonly JWT = {
		ACCESS_TOKEN_EXPIRATION: "1h",
		REFRESH_TOKEN_EXPIRATION: "24h",
		COOKIE_EXPIRATION: 1000 * 60 * 60 * 48,
	};

	public readonly BASIC_AUTH = {
		ENABLED: true,
		USERS: {
			visitor: "zwETB8t3p62OLRf1gxYc",
		},
	};

	public readonly PAGINATED_DEFAULT_VALUE: number = 100;

	public readonly CRON_CONFIG = {
		TEST_JOB: "*/5 * * * * *",
	};
}
