import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["**/*.cjs"], languageOptions: { sourceType: "commonjs", globals: { __dirname: "readonly", process: "readonly", console: "readonly" } },
    rules: { "@typescript-eslint/no-require-imports": "off" } },
);
