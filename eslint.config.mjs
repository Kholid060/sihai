import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tailwind from 'eslint-plugin-tailwindcss';

export default createConfigForNuxt(
  {},
  {
    files: ['**/*.vue', '**/*.ts'],
    ignores: ['node_modules/**/*'],
    rules: {
      'vue/require-default-prop': 'off',
      'vue/no-multiple-template-root': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
).append(
  eslintPluginPrettierRecommended,
  ...tailwind.configs['flat/recommended'],
);
