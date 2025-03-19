import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import canonical from "eslint-plugin-canonical";
import _import from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/.eslintcache",
    "**/.eslintrc.js",
    "eslint-plugin-loop",
    "dist",
    "example.config.ts",
    "example",
    "**/*.d.ts",
    "**/*.d.ts",
    "**/*.cjs",
]), {
    extends: fixupConfigRules(compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
    )),

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslintEslintPlugin),
        canonical,
        import: fixupPluginRules(_import),
        jest,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jest,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",

        parserOptions: {
            project: "tsconfig.json",
            tsconfigRootDir: "/Users/max/loop/prisma-lint",
        },
    },

    settings: {
        "import/resolver": {
            typescript: true,
            node: true,
        },
    },

    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/no-misused-promises": ["error"],
        "@typescript-eslint/no-non-null-assertion": ["error"],

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/switch-exhaustiveness-check": "error",

        "canonical/filename-match-regex": ["error", {
            regex: "^[0-9a-z-.]+$",
            ignoreExporting: false,
        }],

        "import/default": "off",
        "import/namespace": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",

        "import/order": ["error", {
            groups: ["builtin", "external", "internal", "sibling", "index"],

            alphabetize: {
                order: "asc",
                caseInsensitive: false,
            },

            "newlines-between": "always-and-inside-groups",
        }],

        "jest/no-identical-title": "error",

        "max-len": ["error", {
            code: Infinity,
            comments: 100,
            ignorePattern: "( = |eslint|http|AND |src|ts-ignore|yarn)",
        }],

        "no-console": "error",
        "no-debugger": "error",
        "no-useless-catch": "error",
        "no-useless-return": "error",
        "prefer-template": "error",
        "sort-imports": "off",

        quotes: ["error", "single", {
            avoidEscape: true,
            allowTemplateLiterals: false,
        }],
    },
}]);
