import {
  ANALYTIC_INTERVAL_PREFIX,
  type AnalyticsInterval,
} from '~/server/const/analytics.const';

const ANALYTICS_INTERVAL_DAY_COUNT: Record<AnalyticsInterval, number> = {
  '7d': 7,
  '24h': 1,
  '14d': 14,
  '30d': 30,
} as const;

function parseIntervalDateStr(interval: string) {
  const dates = interval.slice(ANALYTIC_INTERVAL_PREFIX.length);

  const endDate = new Date(dates[1]);
  const startDate = new Date(dates[0]);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate)) return null;

  return { startDate, endDate };
}

export function getIntervalDayCount(interval: AnalyticsInterval) {
  if (interval.startsWith(ANALYTIC_INTERVAL_PREFIX)) {
    const date = parseIntervalDateStr(interval);
    if (!date) return date;

    return dateDiffInDays(date.startDate, date.endDate);
  }

  return ANALYTICS_INTERVAL_DAY_COUNT[interval] ?? null;
}

export function getIntervalDate(interval: AnalyticsInterval) {
  if (interval.startsWith(ANALYTIC_INTERVAL_PREFIX)) {
    const date = parseIntervalDateStr(interval);
    if (!date) return date;

    return date;
  }

  const dayDiff = ANALYTICS_INTERVAL_DAY_COUNT[interval] ?? null;
  if (dayDiff === null) return null;

  const endDate = new Date();
  const startDate = new Date(endDate);

  startDate.setDate(endDate.getDate() - dayDiff);
  if (interval !== '24h') startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);

  return {
    endDate,
    startDate,
  };
}

export function getIntervalQuery(interval: AnalyticsInterval) {
  const date = getIntervalDate(interval);
  if (!date) return null;

  return {
    ...date,
    trunc: interval === '24h' ? 'hour' : 'day',
  };
}
