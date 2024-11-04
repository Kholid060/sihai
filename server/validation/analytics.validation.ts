import { z } from 'zod';
import { ANALYTICS_GROUP, ANALYTICS_INTERVAL } from '../const/analytics.const';

export const analyticsQueryValidation = z.object({
  linkId: z.string().optional(),
  groupBy: z.enum(ANALYTICS_GROUP),
  interval: z.enum(ANALYTICS_INTERVAL).optional().default('24h'),
});
export type AnalyticsQueryValidation = z.infer<typeof analyticsQueryValidation>;
