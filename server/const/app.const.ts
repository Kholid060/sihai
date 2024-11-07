export const APP_PLAN_ID = {
  free: 'free',
} as const;

export const APP_FREE_PLAN = {
  maxUrl: 15,
  maxRules: 3,
  maxRedirect: 500,
  name: 'Free plan',
  id: APP_PLAN_ID.free,
} as const;

export const APP_DOMAIN = 'example.com';
