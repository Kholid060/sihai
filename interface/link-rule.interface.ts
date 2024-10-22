export type LinkRuleConditionDataType =
  | 'boolean'
  | 'string'
  | 'number'
  | 'date'
  | 'list'
  | 'time';

export type LinkRuleConditionBase<T extends string> = {
  id: T;
  group: string;
  label: string;
  type: LinkRuleConditionDataType;
  possibleValues?: (string | { label: string; value: string | number })[];
};
