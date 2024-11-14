import type { H3Event } from 'h3';
import acceptLanguage from 'accept-language';
import languages from '~/data/language.json';
import Bowser from 'bowser';
import path from 'node:path';
import type { Reader, CountryResponse } from 'maxmind';
import { BROWSER_ALIASES_MAP } from 'bowser/src/constants';
import { uuid } from '~/lib/crypto';

acceptLanguage.languages(Object.keys(languages));

let lookup: Reader<CountryResponse>;

export interface SessionData {
  ip: string;
  os: string;
  isQr: boolean;
  device: string;
  browser: string;
  sessionId: string;
  userAgent: string;
  referer: string | null;
  country: string | null;
  refPath: string | null;
  language: string | null;
  refDomain: string | null;
}

const OS_MAP_ALIAS = Object.fromEntries(
  Object.entries(Bowser.OS_MAP).map(([key, value]) => [value, key]),
);

async function getCountry(event: H3Event, ip: string) {
  if (event.headers.has('cf-ipcountry')) {
    return event.headers.get('cf-ipcountry');
  }
  if (event.headers.has('x-vercel-ip-country')) {
    return event.headers.get('x-vercel-ip-country');
  }

  if (!import.meta.dev) return null;

  if (!lookup) {
    const dir = path.join(process.cwd(), 'geo');
    const maxmind = await import('maxmind');
    lookup = await maxmind.open(path.resolve(dir, 'GeoLite2-Country.mmdb'));
  }

  return lookup?.get(ip)?.country?.iso_code ?? null;
}

function getRefererData(referer: string | null) {
  let refPath = null;
  let refDomain = null;

  if (referer) {
    const url = new URL(referer);
    refDomain = url.hostname;
    refPath = url.pathname.slice(0, 500);
  }

  return {
    refPath,
    referer,
    refDomain,
  };
}

export const getSessionData = defineCachedFunction(
  async (event: H3Event, sessionId: string): Promise<SessionData> => {
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? '';

    const userAgent = event.headers.get('user-agent') ?? '';
    const uaParser = Bowser.getParser(userAgent ?? '', true);

    return {
      ip,
      userAgent,
      sessionId,
      device: uaParser.getPlatformType(),
      country: await getCountry(event, ip),
      os: OS_MAP_ALIAS[uaParser.getOSName()],
      isQr: Object.hasOwn(getQuery(event), 'qr'),
      ...getRefererData(event.headers.get('referer')),
      browser: BROWSER_ALIASES_MAP[uaParser.getBrowserName()],
      language: acceptLanguage.get(event.headers.get('accept-language')),
    };
  },
  {
    maxAge: 3,
    getKey: (_event: unknown, sessionId: string) => 'session' + sessionId,
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
