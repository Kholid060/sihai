import type { LinkUTMOptionsValidation } from '../validation/link.validation';

export const LINKS_SORT_BY = {
  createdAt: 'created-at',
  clicksCount: 'clicks-count',
} as const;
export type LinksSortBy = (typeof LINKS_SORT_BY)[keyof typeof LINKS_SORT_BY];

export const LINK_UTM_QUERY_MAP: Record<
  keyof LinkUTMOptionsValidation,
  string
> = {
  ref: 'ref',
  term: 'utm_term',
  source: 'utm_source',
  medium: 'utm_medium',
  content: 'utm_content',
  campaign: 'utm_campaign',
} as const;
