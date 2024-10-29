import { z } from 'zod';
import {
  DB_LINK_DESCRIPTION_MAX_LEN,
  DB_LINK_TITLE_MAX_LEN,
} from '../const/db.const';
import type { LinkRuleConditionOperator } from '../const/link.const';
import {
  LINK_RULE_CONDITION_OPERATOR,
  LINK_RULE_CONDITION_TYPE,
} from '../const/link.const';

export const zHex = z.string().regex(/^#[0-9a-f]{3,6}$/i, 'Invalid HEX color');

export const linkQROptionsValidation = z.object({
  logo: z.boolean().default(true),
  color: zHex.optional().default('#000'),
  bgColor: zHex.optional().default('#fff'),
});
export type LinkQROptionsValidation = z.infer<typeof linkQROptionsValidation>;

const MAX_UTM_LEN = 512;
export const linkUTMOptionsValidation = z.object({
  ref: z.string().max(MAX_UTM_LEN).optional(),
  term: z.string().max(MAX_UTM_LEN).optional(),
  source: z.string().max(MAX_UTM_LEN).optional(),
  medium: z.string().max(MAX_UTM_LEN).optional(),
  content: z.string().max(MAX_UTM_LEN).optional(),
  campaign: z.string().max(MAX_UTM_LEN).optional(),
});
export type LinkUTMOptionsValidation = z.infer<typeof linkUTMOptionsValidation>;

export const linkRuleConditionValidation = z.object({
  id: z.string().min(1).max(4),
  left: z.enum(LINK_RULE_CONDITION_TYPE),
  isNot: z.boolean().optional(),
  operator: z.enum(
    Object.keys(LINK_RULE_CONDITION_OPERATOR) as [
      LinkRuleConditionOperator,
      ...LinkRuleConditionOperator[],
    ],
  ),
  right: z.union([z.string(), z.string().array()]),
});
export type LinkRuleConditionValidation = z.infer<
  typeof linkRuleConditionValidation
>;

export const linkRuleValidation = z.object({
  target: z.string().url(),
  id: z.string().max(8).min(1),
  conditions: linkRuleConditionValidation.array().array(),
  name: z.string().max(128).default('Unnamed rule').optional(),
});
export type LinkRuleValidation = z.infer<typeof linkRuleValidation>;

export const newLinkValidation = z.object({
  key: z
    .string()
    .regex(
      /^[A-Za-z0-9-._~:/#[\]@!$'()*+,;%=]*$/,
      `Allowed characters -._~:/#[\\]@!$'()*+,;%=`,
    )
    .min(3)
    .max(128)
    .optional()
    .or(z.literal('')),
  qrOptions: linkQROptionsValidation,
  utmOptions: linkUTMOptionsValidation,
  target: z.string().url().max(1024),
  rules: linkRuleValidation.array().default([]),
  title: z.string().max(DB_LINK_TITLE_MAX_LEN).optional(),
  description: z.string().max(DB_LINK_DESCRIPTION_MAX_LEN).optional(),
});
export type NewLinkValidation = z.infer<typeof newLinkValidation>;

export const updateLinkValidation = newLinkValidation.partial();
export type UpdateLinkValidation = z.infer<typeof updateLinkValidation>;

const nextCursorQuery = z.tuple([
  z.string(),
  z.coerce.number().min(0).optional(),
]);
export const linkQueryValidation = z.object({
  q: z.string().optional(),
  sortAsc: z
    .unknown()
    .transform(() => undefined)
    .optional()
    .transform((str) => {
      if (typeof str === 'undefined') return false;

      switch (str) {
        case 'true':
          return true;
        case 'false':
          return false;
        default:
          throw new Error("The string must be 'true' or 'false'");
      }
    }),
  sortBy: z.enum(['create-date', 'clicks']).default('create-date'),
  nextCursor: z
    .string()
    .transform((data) => {
      const [id, clicks] = nextCursorQuery.parse(atob(data).split(','));
      return { id, clicks };
    })
    .optional(),
});
export type LinkQueryValidation = z.infer<typeof linkQueryValidation>;
