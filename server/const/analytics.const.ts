export const ANALYTICS_PERIOD = ['24h', '7d', '14d', '30d', '90d'] as const;
export type AnalyticsPeriod =
  (typeof ANALYTICS_PERIOD)[keyof typeof ANALYTICS_PERIOD];

export const ANALYTICS_GROUP = [
  'os',
  'link',
  'target',
  'device',
  'country',
  'browser',
  'trigger',
  'referer',
  'language',
] as const;
export type AnalyticsGroup =
  (typeof ANALYTICS_PERIOD)[keyof typeof ANALYTICS_PERIOD];
