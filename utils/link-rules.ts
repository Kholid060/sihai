import type {
  LinkRuleConditionBase,
  LinkRuleConditionDataType,
} from '~/interface/link-rule.interface';
import Bowser from 'bowser';
import countryData from '~/data/country.json';
import type {
  LinkRuleConditionOperator,
  LinkRuleConditionType,
} from '~/server/const/link.const';

const LINK_RULE_GROUP = {
  url: 'URL',
  other: 'Other',
  device: 'Device',
  time: 'Date & Time',
  location: 'Location',
};

export const linkRuleItems: {
  [T in LinkRuleConditionType]: LinkRuleConditionBase<T>;
} = {
  'is-qr': {
    id: 'is-qr',
    type: 'boolean',
    label: 'Is from QR',
    group: LINK_RULE_GROUP.url,
  },
  'url-query': {
    id: 'url-query',
    type: 'string',
    label: 'URL Query',
    group: LINK_RULE_GROUP.url,
  },
  country: {
    id: 'country',
    type: 'string',
    label: 'Country',
    group: LINK_RULE_GROUP.location,
    possibleValues: Object.entries(countryData).map(([value, label]) => ({
      label,
      value,
    })),
  },
  browser: {
    id: 'browser',
    type: 'list',
    label: 'Browser',
    group: LINK_RULE_GROUP.device,
    possibleValues: Object.entries(Bowser.BROWSER_MAP).map(
      ([value, label]) => ({
        label,
        value,
      }),
    ),
  },
  language: {
    id: 'language',
    type: 'list',
    label: 'Language',
    group: LINK_RULE_GROUP.location,
  },
  date: {
    id: 'date',
    type: 'date',
    label: 'Date',
    group: LINK_RULE_GROUP.time,
  },
  day: {
    id: 'day',
    type: 'list',
    label: 'Day of week',
    group: LINK_RULE_GROUP.time,
    possibleValues: [
      { label: 'Sunday', value: 0 },
      { label: 'Monday', value: 1 },
      { label: 'Tuesday', value: 2 },
      { label: 'Wednesday', value: 3 },
      { label: 'Thursday', value: 4 },
      { label: 'Friday', value: 5 },
      { label: 'Saturday', value: 6 },
    ],
  },
  ip: {
    id: 'ip',
    type: 'string',
    label: 'IP Address',
    group: LINK_RULE_GROUP.location,
  },
  device: {
    id: 'device',
    type: 'string',
    label: 'Device type',
    group: LINK_RULE_GROUP.device,
  },
  os: {
    id: 'os',
    type: 'string',
    label: 'Operating System',
    group: LINK_RULE_GROUP.device,
  },
  time: {
    id: 'time',
    type: 'time',
    label: 'Time',
    group: LINK_RULE_GROUP.time,
  },
  'user-agent': {
    id: 'user-agent',
    type: 'string',
    label: 'User agent',
    group: LINK_RULE_GROUP.other,
  },
};

export const linkRuleConditionOperatorsByType: Record<
  LinkRuleConditionDataType,
  Partial<LinkRuleConditionOperator>[]
> = {
  list: ['e', 'iao'],
  boolean: ['it', 'if'],
  string: ['e', 'con', 'iao'],
  time: ['e', 'gt', 'gte', 'iao'],
  date: ['e', 'gt', 'gte', 'iao', 'lt', 'lte'],
  number: ['e', 'gt', 'gte', 'iao', 'lt', 'lte'],
};
