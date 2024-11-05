import type { LinkRuleValidation } from '~/server/validation/link.validation';
import type { H3Event } from 'h3';
import type {
  LinkRuleConditionOperator,
  LinkRuleConditionType,
} from '~/server/const/link.const';
import {
  parseDate,
  Time,
  CalendarDate,
  parseTime,
} from '@internationalized/date';
import acceptLanguage from 'accept-language';
import languages from '~/data/language.json';
import type { SessionData } from '../lib/session';

acceptLanguage.languages(Object.keys(languages));

const isString = (val: unknown): val is string => typeof val === 'string';
const isDateTimeObj = (val: unknown): val is CalendarDate | Time =>
  val instanceof CalendarDate || val instanceof Time;

function convertToDateTime(
  value: unknown,
  type: 'date' | 'time',
): CalendarDate | Time | null {
  try {
    if (typeof value !== 'string') return null;
    return type === 'date' ? parseDate(value) : parseTime(value);
  } catch {
    return null;
  }
}

function testCondition(
  left: unknown,
  operator: LinkRuleConditionOperator,
  right: unknown,
): boolean {
  if (
    (operator === 'iao' && !Array.isArray(right)) ||
    (Array.isArray(right) && operator !== 'iao')
  )
    return false;

  if (isDateTimeObj(left)) {
    const type = left instanceof CalendarDate ? 'date' : 'time';
    const rightValue =
      Array.isArray(right) && operator === 'iao'
        ? right.map((val) => convertToDateTime(val, type))
        : convertToDateTime(right, type);
    if (!rightValue) return false;

    switch (operator) {
      case 'e':
        return (left as Time).compare(rightValue as Time) === 0;
      case 'lt':
        return (left as Time).compare(rightValue as Time) < 0;
      case 'gt':
        return (left as Time).compare(rightValue as Time) > 0;
      case 'gte': {
        const val = (left as Time).compare(rightValue as Time);
        return val === 0 || val > 0;
      }
      case 'lte': {
        const val = (left as Time).compare(rightValue as Time);
        return val === 0 || val < 0;
      }
      case 'iao': {
        return (rightValue as Time[]).some(
          (time) => (left as Time).compare(time) === 0,
        );
      }
      default:
        return false;
    }
  }

  switch (operator) {
    case 'con':
      return isString(left) && isString(right) ? left.includes(right) : false;
    case 'e':
      return left === right;
    case 'gt':
      return <number>left > <number>right;
    case 'gte':
      return <number>left >= <number>right;
    case 'iao':
      return (right as unknown[]).includes(left);
    case 'if':
      return left === false;
    case 'it':
      return left === true;
    case 'lt':
      return <number>left < <number>right;
    case 'lte':
      return <number>left <= <number>right;
    default:
      return false;
  }
}

interface LinkRulesTesterOptions {
  event: H3Event;
  sessionData: SessionData;
  rules: LinkRuleValidation[];
}

export class LinkRulesTester {
  private readonly event: H3Event;
  private readonly rules: LinkRuleValidation[];

  private sessionData: SessionData;
  private cacheData: Partial<Record<LinkRuleConditionType, unknown>> = {};

  constructor({ event, rules, sessionData }: LinkRulesTesterOptions) {
    this.rules = rules;
    this.event = event;
    this.sessionData = sessionData;
  }

  private getConditionLeftValue(type: LinkRuleConditionType) {
    if (Object.hasOwn(this.cacheData, type)) return this.cacheData[type];

    switch (type) {
      case 'browser':
        return this.sessionData.browser;
      case 'country':
        return this.sessionData.country;
      case 'date': {
        const date = new Date();
        this.cacheData.date = new CalendarDate(
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate(),
        );
        return this.cacheData.date;
      }
      case 'day':
        this.cacheData.day = new Date().getUTCDay().toString();
        return this.cacheData.day;
      case 'referer':
        return this.sessionData.referer;
      case 'device':
        return this.sessionData.device;
      case 'os':
        return this.sessionData.os;
      case 'ip':
        return this.sessionData.ip;
      case 'is-qr':
        return this.sessionData.isQr;
      case 'language': {
        return this.sessionData.language;
      }
      case 'time': {
        const date = new Date();
        this.cacheData.time = new Time(
          date.getUTCHours(),
          date.getUTCMinutes(),
        );
        return this.cacheData.time;
      }
      case 'url-query':
        this.cacheData['url-query'] = new URL(
          this.event.path,
          'https://localhost',
        ).search.slice(1);
        return this.cacheData['url-query'];
      case 'user-agent':
        return this.sessionData.userAgent;
      default:
        throw new Error(`"${type}" is invalid type`);
    }
  }

  private matchConditions(conditions: LinkRuleValidation['conditions']) {
    for (const andConditions of conditions) {
      const matchAllConditions = andConditions.every((condition) => {
        const result = testCondition(
          this.getConditionLeftValue(condition.left),
          condition.operator,
          condition.right,
        );

        return condition.isNot ? !result : result;
      });
      if (matchAllConditions) return true;
    }

    return false;
  }

  findMatch() {
    return this.rules.find((rule) => this.matchConditions(rule.conditions));
  }

  static findMatchRules(options: LinkRulesTesterOptions) {
    if (options.rules.length === 0) return null;

    return new LinkRulesTester(options).findMatch();
  }
}
