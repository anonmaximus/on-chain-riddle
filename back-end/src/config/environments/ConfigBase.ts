export default abstract class ConfigBase {
	abstract readonly APP_ROUTINGS: Readonly<{
		BASE_URL: string;
		API_URL: string;
	}>;

	abstract readonly CROSS_DOMAIN_ORIGIN: string;

	abstract readonly JWT: Readonly<{
		ACCESS_TOKEN_EXPIRATION: string;
		REFRESH_TOKEN_EXPIRATION: string;
		COOKIE_EXPIRATION: number;
	}>;

	abstract readonly BASIC_AUTH: Readonly<{
		ENABLED: boolean;
		USERS: {
			visitor: string;
		};
	}>;

	abstract readonly PAGINATED_DEFAULT_VALUE: number;

	abstract readonly CRON_CONFIG: {
		TEST_JOB: string;
	};
}
