import logger from "#Services/Logger";
import { container } from "tsyringe";

import TestJob from "./TestJob";

export default {
	start: () => {
		container.resolve(TestJob).process().catch(logger.error);
	},
};
