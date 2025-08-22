import js from "@eslint/js";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { globalIgnores } from "eslint/config";
import configPrettier from "eslint-config-prettier/flat";
import commentLength from "eslint-plugin-comment-length";
import pluginImport from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import promise from "eslint-plugin-promise";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

const dirname = import.meta.dirname;
void dirname;

// eslint-disable-next-line import/no-default-export
export default tseslint.config([
  globalIgnores([
    "coverage",
    "dist",
    "docs",
    "examples",
    "types",
    "**/.DS_Store",
    "**/node_modules",
    "**/.env",
    "**/*.tgz",
  ]),

  // Error on unused disable directives
  { linterOptions: { reportUnusedDisableDirectives: "error" } },

  // Add node globals
  { languageOptions: { globals: globals.node } },

  // Configure default rules
  js.configs.recommended,
  {
    rules: {
      "no-console": "error",
      "spaced-comment": ["error", "always", { block: { balanced: true } }],
    },
  },

  // Call out misuse of eslint directive comments
  eslintComments.recommended,

  // Add autofixable comment length rules
  // eslint-disable-next-line import/no-named-as-default-member
  commentLength.configs["flat/recommended"],
  {
    rules: {
      "comment-length/limit-multi-line-comments": "error",
      "comment-length/limit-single-line-comments": "error",
    },
  },

  // Configure Unicorn
  unicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
      "unicorn/import-style": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            desc: {
              description: true,
            },
            sr: {
              subreddit: true,
            },
          },
        },
      ],
      "unicorn/switch-case-braces": ["error", "avoid"],
    },
  },

  // Import sorting
  pluginImport.flatConfigs.recommended,
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    rules: {
      "import/first": "error",
      "import/no-default-export": "error",
      "import/no-duplicates": "error",
      "import/no-named-as-default-member": "error",
      "import/no-named-as-default": "error",
      "import/no-unresolved": "off",
    },
  },
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            [String.raw`\u0000$`],
            [String.raw`^\u0000`],
            [String.raw`^@?\w`],
            ["^"],
            [String.raw`^\.`],
          ],
        },
      ],
    },
  },

  // Promise rules
  {
    plugins: { promise },
    rules: {
      "promise/prefer-await-to-callbacks": "error",
      "promise/prefer-await-to-then": "error",
    },
  },

  // TypeScript rules
  tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  { files: ["**/*.ts"], ...pluginImport.flatConfigs.typescript },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
        },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["class", "interface", "typeAlias", "typeParameter"],
          format: ["PascalCase"],
        },
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
      ],
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
      "@typescript-eslint/require-await": "off",
      "unicorn/no-this-assignment": "off",
    },
  },

  // Tests
  { files: ["**/__tests__/**/*.ts"], ...jest.configs["flat/recommended"] },
  {
    files: ["**/__tests__/**/*.ts"],
    rules: {
      "jest/expect-expect": [
        "error",
        { assertFunctionNames: ["expect", "n.done"] },
      ],
    },
  },

  configPrettier,
]);
