import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: {
    stylistic: { semi: true },
  },
}, {
  files: ['**/*.vue'],
  rules: {
    'vue/require-default-prop': 'off',
  },
});
