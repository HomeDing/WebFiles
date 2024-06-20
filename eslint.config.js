import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        micro: "readonly",
        MicroControl: "readonly",
        toBool: "readonly",
        toSeconds: "readonly",
        createHTMLElement: "readonly",
        GenericWidgetClass: "readonly",
        hub: "readonly",
        jsonFind: "readonly",
        updateState: "readonly",
        jsonLocate: "readonly",
        getHashParams: "readonly",
        DialogClass: "readonly"
      }

    },

    rules: {
      semi: [2, "always"],

      "no-multiple-empty-lines": ["error", {
        max: 2,
        maxBOF: 1,
      }],

      "space-before-function-paren": 0,
      "padded-blocks": 0,
      "no-empty": 0,
      "no-unused-expressions": "off" ,
      "@typescript-eslint/triple-slash-reference": 0,      
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-unsafe-declaration-merging": 0,
    },

  },


];