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

export const LINK_RULE_CONDITION_TYPE = [
  'ip',
  'os',
  'day',
  'date',
  'time',
  'is-qr',
  'browser',
  'country',
  'language',
  'user-agent',
  'url-query',
  'device',
  'day-user',
  'date-user',
  'time-user',
] as const;
export type LinkRuleConditionType = (typeof LINK_RULE_CONDITION_TYPE)[number];

export const LINK_RULE_CONDITION_OPERATOR = {
  e: 'Equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  iao: 'Is any of',
  con: 'Contains',
  it: 'Is true',
  if: 'Is false',
} as const;
export type LinkRuleConditionOperator =
  keyof typeof LINK_RULE_CONDITION_OPERATOR;

export const LINK_MAX_CONDITIONS = 8;
