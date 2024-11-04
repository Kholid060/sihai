import type { H3Event } from 'h3';
import acceptLanguage from 'accept-language';
import languages from '~/data/language.json';
import { lookup } from 'ip-location-api';
import Bowser from 'bowser';
import { BROWSER_ALIASES_MAP } from 'bowser/src/constants';
import { uuid } from '~/lib/crypto';

acceptLanguage.languages(Object.keys(languages));

export interface SessionData {
  ip: string;
  os: string;
  isQr: boolean;
  device: string;
  browser: string;
  sessionId: string;
  userAgent: string;
  country: string | null;
  refPath: string | null;
  language: string | null;
  refDomain: string | null;
}

const OS_MAP_ALIAS = Object.fromEntries(
  Object.entries(Bowser.OS_MAP).map(([key, value]) => [value, key]),
);

export const getSessionData = defineCachedFunction(
  (event: H3Event, sessionId: string): SessionData => {
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? '';

    const userAgent = event.headers.get('user-agent') ?? '';
    const uaParser = Bowser.getParser(userAgent ?? '', true);

    let refPath = null;
    let refDomain = null;

    const referer = event.headers.get('referer');
    if (referer) {
      const url = new URL(referer);
      refDomain = url.hostname;
      refPath = url.pathname.slice(0, 500);
    }

    return {
      ip,
      refPath,
      refDomain,
      userAgent,
      sessionId,
      device: uaParser.getPlatformType(),
      os: OS_MAP_ALIAS[uaParser.getOSName()],
      isQr: Object.hasOwn(getQuery(event), 'qr'),
      browser: BROWSER_ALIASES_MAP[uaParser.getBrowserName()],
      country: ip ? ((lookup(ip)?.country as string) ?? null) : null,
      language: acceptLanguage.get(event.headers.get('accept-language')),
    };
  },
  {
    maxAge: 5,
    getKey: (_event: unknown, sessionId: string) => sessionId,
  },
);

export async function getSessionId(event: H3Event) {
  const userAgent = event.headers.get('user-agent') ?? '';
  const ip =
    (await getRequestFingerprint(event, { xForwardedFor: true })) ?? '';
  const date = new Date();

  return uuid(
    userAgent,
    ip,
    `${date.getHours()}-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`,
  );
}
