import Config from "#Config/index";
import logger from "#Services/Logger";
import { CronJob } from "cron";
import { singleton } from "tsyringe";

@singleton()
export default class TestJob {
	private isRunning = false;

	constructor(private readonly config: Config) {}

	public async process() {
		new CronJob(
			this.config.CRON_CONFIG.TEST_JOB,
			async () => {
				if (this.isRunning) return;
				this.isRunning = true;
				try {
					await Promise.resolve();
				} catch (error) {
					logger.error("Error while processing TestJob:", error);
				} finally {
					this.isRunning = false;
				}
			},
			null,
			true,
		);
	}
}
