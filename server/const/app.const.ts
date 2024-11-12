export const APP_PLAN_ID = {
  free: 'free',
} as const;

export const APP_FREE_PLAN = {
  maxUrl: 10,
  maxRules: 3,
  maxRedirect: 350,
  name: 'Free plan',
  id: APP_PLAN_ID.free,
} as const;

export const APP_NAME = 'Sihai';
