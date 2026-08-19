import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
        }),
    ],
    resolve: {
        alias: {
            "#root": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        // Environment
        environment: "jsdom",
        setupFiles: ["./src/test/setupTests.ts"],

        // File patterns
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        exclude: [
            "node_modules/",
            "dist/",
            "build/",
            "e2e/",
            "**/*.e2e.{test,spec}.{ts,tsx}",
            "**/*.stories.{ts,tsx}",
        ],

        // CSS and assets
        css: true,
        globals: true,

        // Coverage configuration
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json", "json-summary"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/**/*.{test,spec}.{ts,tsx}",
                "src/**/*.d.ts",
                "src/test/**",
                "src/**/*.stories.{ts,tsx}",
                "src/index.tsx",
                "src/vite-env.d.ts",
                "src/**/*.config.{ts,tsx}",
                "src/**/types/**",
                "src/**/constants/**",
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
                // Per-file thresholds for critical files
                "src/utils/**": {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90,
                },
            },
            // Coverage collection options
            clean: true,
            cleanOnRerun: true,
        },

        // Timeouts
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 10000,

        // Performance
        pool: "threads",
        // Retry and bail
        retry: 2,
        bail: 0,

        // Reporting
        reporters: ["verbose", "json", "html"],
        outputFile: {
            json: "./test-results/results.json",
            html: "./test-results/index.html",
        },

        // Watch mode
        watch: false,

        // Type checking
        typecheck: {
            enabled: true,
            include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },

        // Mock handling
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
    },
});
