export type LinkRuleConditionDataType =
  | 'boolean'
  | 'string'
  | 'number'
  | 'date'
  | 'list'
  | 'time';

export type LinkRuleConditionOptionItem = { label: string; value: string };

export type LinkRuleConditionBase<T extends string> = {
  id: T;
  group: string;
  label: string;
  type: LinkRuleConditionDataType;
  possibleValues?: LinkRuleConditionOptionItem[];
};
