import type { SetRequired } from 'type-fest';
import type { NewPlan } from '~/db/schema';

export const APP_PLAN_ID = {
  free: 'free-plan',
} as const;

export const APP_FREE_PLAN: SetRequired<
  NewPlan,
  'name' | 'maxUrl' | 'maxRedirect' | 'maxRules'
> = {
  maxUrl: 5,
  maxRules: 3,
  maxRedirect: 500,
  name: 'Free plan',
  id: APP_PLAN_ID.free,
} as const;
