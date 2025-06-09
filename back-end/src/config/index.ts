import { container, Lifecycle } from "tsyringe";

import Development from "./environments/Development";
import Production from "./environments/Production";
import Staging from "./environments/Staging";
import { Variables } from "./Variables";

const variables = container.resolve(Variables);

class Config extends Production {
	public constructor() {
		super();
		throw new Error("Config is a singleton class, use container.resolve(Config) instead.");
	}
}

const Envs: Record<Variables["APP_ENV"], typeof Config> = {
	development: Development,
	staging: Staging,
	production: Production,
};

container.register(Config, { useClass: Envs[variables.APP_ENV] }, { lifecycle: Lifecycle.Singleton });

export default Config;
