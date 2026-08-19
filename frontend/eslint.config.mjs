import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";

const compat = new FlatCompat({
    baseDirectory: path.resolve(),
    recommendedConfig: js.configs.recommended,
});

export default [
    {
        linterOptions: {
            reportUnusedDisableDirectives: false,
        },
    },
    {
        ignores: [
            "dist/",
            "build/",
            "dev-dist/",
            "coverage/",
            "test-results/",
            "playwright-report/",
            "node_modules/",
            "*.config.js",
            "*.config.ts",
            "*.config.mjs",
            "*.config.cjs",
            "tailwind.config.js",
            "vite.config.js",
            "postcss.config.js",
            "playwright.config.ts",
            "eslint.config.mjs",
            "**/*.d.ts",
            "*.generated.*",
            ".env*",
            "*.md",
            "*.log",
            "tmp/",
            "temp/",
            ".tmp/",
            ".vscode/",
            ".idea/",
            ".DS_Store",
            "Thumbs.db",
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "sw.js",
            "workbox-*.js",
            "public/",
            "analyze/",
            "scripts/",
            "src/media/",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "e2e/**/*",
        ],
    },
    ...compat.config({
        parser: "@typescript-eslint/parser",
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
            ecmaVersion: "latest",
            sourceType: "module",
            project: "./tsconfig.json",
        },
        plugins: ["@typescript-eslint", "react-hooks", "react", "prettier", "import"],
        extends: [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:prettier/recommended",
            "plugin:react-hooks/recommended",
            "plugin:react/recommended",
            "plugin:import/errors",
            "plugin:import/warnings",
            "plugin:import/typescript",
        ],
        rules: {
            // Prettier integration
            "prettier/prettier": "error",

            // React Hooks
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/immutability": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/refs": "off",

            // React
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/display-name": "off",
            "react/no-unescaped-entities": "off",
            "react/jsx-max-props-per-line": ["error", { maximum: 1, when: "multiline" }],
            "react/jsx-first-prop-new-line": ["error", "multiline"],
            "react/jsx-indent-props": ["error", 4],

            // TypeScript
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-non-null-assertion": "off",

            // General
            "prefer-const": "error",
            "no-extra-boolean-cast": "off",
            "no-console": "off",
            "no-debugger": "error",
            "no-unused-expressions": "error",
            "no-duplicate-imports": "error",

            // Import
            "import/order": "off",
            "import/no-unresolved": "error",
            "import/no-duplicates": "error",
            "import/no-unused-modules": "off",
            "import/no-cycle": "off",
        },
        env: {
            browser: true,
            es2021: true,
            node: true,
        },
        settings: {
            react: {
                version: "detect",
            },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
                alias: {
                    map: [["#root", "./src"]],
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
            },
        },
        overrides: [
            {
                files: ["*.test.tsx", "*.test.ts", "*.spec.tsx", "*.spec.ts"],
                env: {
                    jest: true,
                },
                rules: {
                    "@typescript-eslint/no-explicit-any": "off",
                    "@typescript-eslint/no-non-null-assertion": "off",
                    "no-console": "off",
                },
            },
            {
                files: ["*.config.js", "*.config.ts", "*.config.mjs"],
                env: {
                    node: true,
                },
                rules: {
                    "@typescript-eslint/no-var-requires": "off",
                    "import/no-extraneous-dependencies": "off",
                    "no-console": "off",
                },
            },
        ],
    }),
];
