import type { UiTabVariant } from '.';
import { TABS_INJECTION_KEY } from './injectionKey';

export function useTabVariant() {
  return inject<UiTabVariant>(TABS_INJECTION_KEY, 'default');
}
