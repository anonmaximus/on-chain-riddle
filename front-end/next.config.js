/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ["tsyringe"],

	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				"reflect-metadata": require.resolve("reflect-metadata"),
			};
		}

		return config;
	},
};

module.exports = nextConfig;
