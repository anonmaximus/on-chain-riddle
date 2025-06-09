module.exports = {
	overrides: [
		{
			files: [
				"./**/*.ts",
				"./**/*.tsx",
				"./**/*.json",
				"./**/*.scss",
				"./**/*.css",
				"./**/*.js",
			],
			options: {
				tabWidth: 4,
				useTabs: true,
				singleQuote: false,
				trailingComma: "all",
				printWidth: 180,
				semi: true,
				bracketSameLine: true,
			},
		},
	],
};
