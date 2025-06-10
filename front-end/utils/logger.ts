const isDevelopment = process.env.NODE_ENV === "development";

const logger = {
	info: (...args: any[]) => {
		if (isDevelopment) {
			console.log("[INFO]", ...args);
		}
	},

	warn: (...args: any[]) => {
		if (isDevelopment) {
			console.warn("[WARN]", ...args);
		}
	},

	error: (...args: any[]) => {
		console.error("[ERROR]", ...args);
	},

	debug: (...args: any[]) => {
		if (isDevelopment) {
			console.debug("[DEBUG]", ...args);
		}
	},
};

export default logger;
