import type { LinkVariableList } from '~/interface/link.interface';
import type { SessionData } from '../lib/session';

export function linkVariableReplacer(url: string, sessionData: SessionData) {
  return url.replace(/\{(.*?)\}/g, (match, varName) => {
    switch (varName as LinkVariableList) {
      case 'browser':
        return sessionData.browser;
      case 'country':
        return sessionData.country ?? '(unknown)';
      case 'date': {
        const date = new Date();
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
      }
      case 'date-time':
        return new Date().toISOString();
      case 'time': {
        const date = new Date();
        return `${date.getUTCHours()}:${date.getUTCMinutes()}`;
      }
      case 'device':
        return sessionData.device;
      case 'language':
        return sessionData.language ?? '(unknown)';
      case 'os':
        return sessionData.os;
      default:
        return match;
    }
  });
}
