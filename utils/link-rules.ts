import type {
  LinkRuleConditionBase,
  LinkRuleConditionDataType,
} from '~/interface/link-rule.interface';
import Bowser from 'bowser';
import countryData from '~/data/country.json';
import languageData from '~/data/language.json';
import type {
  LinkRuleConditionOperator,
  LinkRuleConditionType,
} from '~/server/const/link.const';

const LINK_RULE_GROUP = {
  url: 'URL',
  device: 'Device',
  request: 'Request',
  time: 'Date & Time',
  location: 'Location',
};

const dayOfWeekOptions = [
  { label: 'Sunday', value: '0' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
];

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
    type: 'list',
    id: 'country',
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
    possibleValues: Object.entries(languageData).map(([value, label]) => ({
      label,
      value,
    })),
  },
  time: {
    id: 'time',
    type: 'time',
    label: 'Time (UTC timezone)',
    group: LINK_RULE_GROUP.time,
  },
  date: {
    id: 'date',
    type: 'date',
    label: 'Date (UTC timezone)',
    group: LINK_RULE_GROUP.time,
  },
  day: {
    id: 'day',
    type: 'list',
    label: 'Day of week (UTC timezone)',
    group: LINK_RULE_GROUP.time,
    possibleValues: dayOfWeekOptions,
  },
  // 'time-user': {
  //   id: 'time-user',
  //   type: 'time',
  //   label: 'Time (User timezone)',
  //   group: LINK_RULE_GROUP.time,
  // },
  // 'date-user': {
  //   id: 'date-user',
  //   type: 'date',
  //   label: 'Date (User timezone)',
  //   group: LINK_RULE_GROUP.time,
  // },
  // 'day-user': {
  //   id: 'day-user',
  //   type: 'list',
  //   label: 'Day of week (User timezone)',
  //   group: LINK_RULE_GROUP.time,
  //   possibleValues: dayOfWeekOptions,
  // },
  ip: {
    id: 'ip',
    type: 'string',
    label: 'IP Address',
    group: LINK_RULE_GROUP.location,
  },
  device: {
    id: 'device',
    type: 'list',
    label: 'Device type',
    group: LINK_RULE_GROUP.device,
    possibleValues: Object.entries(Bowser.PLATFORMS_MAP).map(
      ([value, label]) => ({ value, label }),
    ),
  },
  os: {
    id: 'os',
    type: 'list',
    label: 'Operating System',
    group: LINK_RULE_GROUP.device,
    possibleValues: Object.entries(Bowser.OS_MAP).map(([value, label]) => ({
      value,
      label,
    })),
  },
  'user-agent': {
    id: 'user-agent',
    type: 'string',
    label: 'User agent',
    group: LINK_RULE_GROUP.request,
  },
  referer: {
    id: 'referer',
    type: 'string',
    label: 'Referer',
    group: LINK_RULE_GROUP.request,
  },
};

export const linkRuleConditionOperatorsByType: Record<
  LinkRuleConditionDataType,
  Partial<LinkRuleConditionOperator>[]
> = {
  list: ['e', 'iao'],
  boolean: ['it', 'if'],
  string: ['e', 'con', 'iao'],
  time: ['e', 'iao', 'gt', 'gte', 'lt', 'lte'],
  date: ['e', 'iao', 'gt', 'gte', 'lt', 'lte'],
  number: ['e', 'iao', 'gt', 'gte', 'lt', 'lte'],
};
