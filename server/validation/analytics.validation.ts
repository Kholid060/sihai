import { z } from 'zod';
import { ANALYTICS_GROUP, ANALYTICS_PERIOD } from '../const/analytics.const';

export const analyticsQueryValidation = z.object({
  linkId: z.string().optional(),
  orderBy: z.enum(ANALYTICS_GROUP),
  period: z.enum(ANALYTICS_PERIOD).optional().default('24h'),
});
export type AnalyticsQueryValidation = z.infer<typeof analyticsQueryValidation>;
