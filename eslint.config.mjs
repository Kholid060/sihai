import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: {
    stylistic: { semi: true, arrowParens: true, quoteProps: 'as-needed', braceStyle: false },
  },
}, {
  files: ['**/*.vue', '**/*.ts'],
  ignores: ['node_modules/**/*'],
  rules: {
    'vue/require-default-prop': 'off',
    'vue/no-multiple-template-root': 'off',
  },
});
