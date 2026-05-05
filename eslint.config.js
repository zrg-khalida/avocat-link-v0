import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Stricter checks for TanStack route files. The router code-splitter
  // re-parses these modules and any stray module-scope statement (like a
  // `return` outside a function) hard-fails the dev server with a confusing
  // "Unknown file" overlay. Catch it at lint time with a clear message.
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program > ReturnStatement",
          message:
            "Module-scope `return` is not allowed in route files — it crashes the TanStack code-splitter. Move logic inside the route component.",
        },
        {
          selector: "Program > ExpressionStatement > AwaitExpression",
          message:
            "Top-level `await` is not allowed in route files — wrap it in the loader or component.",
        },
      ],
    },
  },
  eslintPluginPrettier,
);
