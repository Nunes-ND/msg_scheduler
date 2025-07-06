import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	test: {
		globals: true,
		environment: "node",
		include: [],
		pool: "threads",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage",
			include: ["src/**/*.ts"],
			exclude: ["src/main.ts"],
			all: true,
		},
		passWithNoTests: true,
		env: loadEnv(mode, process.cwd(), ""),
		projects: [
			{
				extends: true,
				test: {
					name: { label: "integration", color: "blue" },
					include: ["tests/integration/**/*.test.ts"],
					globalSetup: ["./tests/setup.ts"],
					singleThread: true,
				},
			},
			{
				extends: true,
				test: {
					name: { label: "unit", color: "green" },
					include: ["tests/unit/**/*.test.ts"],
					poolOptions: {
						threads: {
							isolate: true,
							minThreads: 1,
							maxThreads: 4,
						},
					},
				},
			},
		],
	},
	plugins: [
		tsconfigPaths({
			projects: ["./tsconfig.json"],
		}),
	],
}));
