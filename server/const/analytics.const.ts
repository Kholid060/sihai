export const ANALYTICS_INTERVAL = ['24h', '7d', '14d', '30d', '90d'] as const;
export type AnalyticsInterval = (typeof ANALYTICS_INTERVAL)[number];

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
export type AnalyticsGroup = (typeof ANALYTICS_GROUP)[number];

export const ANALYTICS_INTERVAL_DAY_COUNT: Record<AnalyticsInterval, number> = {
  '7d': 7,
  '24h': 1,
  '14d': 14,
  '30d': 30,
  '90d': 90,
};
