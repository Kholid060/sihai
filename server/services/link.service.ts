import type { H3Event } from 'h3';
import Bowser from 'bowser';
import { isbot } from 'isbot';
import {
  linkEventsTable,
  linkSessionsTable,
  linksTable,
  userPlansTable,
} from '~/db/schema';
import { createLimitExceedError } from '../utils/custom-errors';
import type {
  LinkQueryValidation,
  LinkUTMOptionsValidation,
  NewLinkValidation,
  UpdateLinkValidation,
} from '../validation/link.validation';
import { getUserProfile } from './user.service';
import { nanoid } from 'nanoid';
import { compareColumn, incrementDBColumn } from '~/db/db-utils';
import type {
  LinkDetail,
  LinkListItem,
  LinkListResult,
  LinkWithRedirect,
} from '~/interface/link.interface';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import postgres from 'postgres';
import {
  LINK_EVENT_TRIGGER,
  LINK_QUERY_LIMIT,
  LINK_UTM_QUERY_MAP,
} from '../const/link.const';
import { LinkRulesTester } from '~/server/utils/LinkRuleTester';
import type { SessionData } from '../lib/session';
import { getSessionData, getSessionId } from '../lib/session';
import type { DrizzleDB } from '../lib/drizzle';
import { linkVariableReplacer } from '../utils/link-utils';
import type { UserProfile } from '~/interface/user.interface';
import { APP_FREE_PLAN } from '../const/app.const';
import { joinWords } from '~/utils/helper';

async function validateLink(
  db: DrizzleDB,
  userId: string,
  data: NewLinkValidation | UpdateLinkValidation,
) {
  const messages: string[] = [];
  let profile: UserProfile | null;

  const canAccessFeature = async (
    handle: string | ((profile: UserProfile) => void),
  ) => {
    if (!profile) {
      profile = await getUserProfile(db, userId);
    }

    if (profile.plan.name === APP_FREE_PLAN.id) {
      if (typeof handle === 'string') messages.push(handle);
      else handle(profile);
    }
  };

  if (data.expDate) {
    await canAccessFeature('Expiration Date');
  }
  if (data.rules) {
    await canAccessFeature((profile) => {
      if (data.rules!.length > profile.plan.rulesLimit) {
        throw createLimitExceedError('Link rule');
      }
    });
  }

  if (messages.length > 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: `You must be have pro plan and above to use the ${joinWords(messages)} features`,
    });
  }
}

export async function createNewLink(
  db: DrizzleDB,
  userId: string,
  urlData: NewLinkValidation,
): Promise<LinkDetail> {
  const profile = await getUserProfile(db, userId);
  if (profile.plan.linksUsage >= profile.plan.linksLimit) {
    throw createLimitExceedError('URL');
  }

  await validateLink(db, userId, urlData);

  const newLink = await db.transaction(async (tx) => {
    let result: LinkDetail;
    const key = urlData.key ?? nanoid(6);

    try {
      [result] = await tx
        .insert(linksTable)
        .values({
          ...urlData,
          key,
          userId,
          title: urlData.title ?? new URL(urlData.target).hostname,
        })
        .returning();
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === '23505') {
        throw createError({
          statusCode: 409,
          data: { code: 'duplicate-key' },
          message: `"${key}" short link already exists`,
        });
      }

      throw error;
    }
    await tx
      .update(userPlansTable)
      .set({
        linksUsage: incrementDBColumn(userPlansTable.linksUsage),
      })
      .where(eq(userPlansTable.userId, userId));

    return result as LinkDetail;
  });

  // @ts-expect-error unused property
  delete newLink.userId;

  return newLink;
}

export async function findLinksByUser(
  db: DrizzleDB,
  userId: string,
  filter: LinkQueryValidation,
): Promise<LinkListResult> {
  let query = db
    .select({
      id: linksTable.id,
      key: linksTable.key,
      title: linksTable.title,
      clicks: linksTable.clicks,
      target: linksTable.target,
      createdAt: linksTable.createdAt,
    })
    .from(linksTable)
    .where(eq(linksTable.userId, userId))
    .limit(LINK_QUERY_LIMIT)
    .$dynamic();
  if (filter.q?.trim()) {
    query = query.where(ilike(linksTable.title, `%${filter.q.trim()}%`));
  }

  const result: { items: LinkListItem[]; nextCursor: string | null } = {
    items: [],
    nextCursor: null,
  };

  switch (filter.sortBy) {
    case 'clicks': {
      const sortByClicks = filter.sortAsc
        ? asc(linksTable.clicks)
        : desc(linksTable.clicks);
      if (!filter.nextCursor) {
        query = query.orderBy(sortByClicks);
        break;
      }

      if (typeof filter.nextCursor.clicks !== 'number') {
        throw createError({ statusCode: 400 });
      }

      query = query
        .where(
          or(
            compareColumn(
              linksTable.clicks,
              filter.nextCursor.clicks,
              filter.sortAsc ?? false,
            ),
            and(
              eq(linksTable.id, filter.nextCursor.id),
              compareColumn(
                linksTable.id,
                filter.nextCursor.id,
                filter.sortAsc ?? false,
              ),
            ),
          ),
        )
        .orderBy(
          filter.sortAsc ? asc(linksTable.id) : desc(linksTable.id),
          sortByClicks,
        );

      break;
    }
    case 'create-date': {
      query = query.orderBy(
        filter.sortAsc ? asc(linksTable.id) : desc(linksTable.id),
      );

      if (!filter.nextCursor) break;

      query = query.where(
        compareColumn(
          linksTable.id,
          filter.nextCursor.id,
          filter.sortAsc ?? false,
        ),
      );
      break;
    }
    default: {
      throw createError({ statusCode: 400, message: 'Bad Reqquest' });
    }
  }

  result.items = await query.execute();

  const lastItem =
    LINK_QUERY_LIMIT === result.items.length ? result.items.at(-1) : null;
  if (lastItem) {
    result.nextCursor = btoa(
      filter.sortBy === 'clicks'
        ? `${lastItem.id},${lastItem.clicks}`
        : `${lastItem.id},`,
    );
  }

  return result;
}

export const findLinkByKey = defineCachedFunction(
  async (db: DrizzleDB, key: string): Promise<LinkWithRedirect> => {
    const [link] = await db
      .select({
        id: linksTable.id,
        rules: linksTable.rules,
        userId: linksTable.userId,
        target: linksTable.target,
        expUrl: linksTable.expUrl,
        expDate: linksTable.expDate,
        utmOptions: linksTable.utmOptions,
        redirects: {
          id: userPlansTable.id,
          usage: userPlansTable.redirectsUsage,
          limit: userPlansTable.redirectsLimit,
        },
      })
      .from(linksTable)
      .innerJoin(userPlansTable, eq(linksTable.userId, userPlansTable.userId))
      .where(eq(linksTable.key, key))
      .limit(1);
    if (!link) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      });
    }

    return link;
  },
  { getKey: (_, key) => 'link' + key },
);

export const findLinkByUserAndId = defineCachedFunction(
  async (
    db: DrizzleDB,
    userId: string,
    linkId: string,
  ): Promise<LinkDetail> => {
    const [link] = await db
      .select({
        id: linksTable.id,
        key: linksTable.key,
        title: linksTable.title,
        rules: linksTable.rules,
        clicks: linksTable.clicks,
        target: linksTable.target,
        expUrl: linksTable.expUrl,
        expDate: linksTable.expDate,
        archived: linksTable.archived,
        qrOptions: linksTable.qrOptions,
        createdAt: linksTable.createdAt,
        utmOptions: linksTable.utmOptions,
        description: linksTable.description,
      })
      .from(linksTable)
      .where(and(eq(linksTable.id, linkId), eq(linksTable.userId, userId)))
      .limit(1);
    if (!link) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    }

    return link;
  },
  { maxAge: 5, getKey: (_, userId, linkId) => userId + linkId },
);

export async function updateLink(
  db: DrizzleDB,
  userId: string,
  linkId: string,
  data: UpdateLinkValidation,
) {
  if (Object.keys(data).length === 0) return;

  await validateLink(db, userId, data);

  const result = await db
    .update(linksTable)
    .set(data)
    .where(and(eq(linksTable.id, linkId), eq(linksTable.userId, userId)))
    .returning({ id: linksTable.id });
  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
    });
  }
}

export async function deleteLink(
  db: DrizzleDB,
  userId: string,
  linkId: string,
) {
  await db.transaction(async (tx) => {
    const result = await tx
      .delete(linksTable)
      .where(and(eq(linksTable.id, linkId), eq(linksTable.userId, userId)))
      .returning({ id: linksTable.id });
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      });
    }

    await db
      .delete(linkSessionsTable)
      .where(eq(linkSessionsTable.linkId, linkId));
    await db.delete(linkEventsTable).where(eq(linkEventsTable.linkId, linkId));
  });
}

async function insertLinkSession(
  db: DrizzleDB,
  { linkId, userId }: { linkId: string; userId: string },
  {
    os,
    isQr,
    device,
    browser,
    country,
    refPath,
    language,
    targetURL,
    sessionId,
    refDomain,
  }: SessionData & { targetURL: string },
) {
  await db.transaction(async (tx) => {
    await tx
      .insert(linkSessionsTable)
      .values({
        os,
        linkId,
        device,
        userId,
        country,
        browser,
        language,
        id: sessionId,
      })
      .onConflictDoUpdate({
        target: linkSessionsTable.id,
        set: {
          event: incrementDBColumn(linkSessionsTable.event),
        },
      });
    await tx.insert(linkEventsTable).values({
      linkId,
      userId,
      refPath,
      refDomain,
      linkSessionId: sessionId,
      target: targetURL.slice(0, 500),
      trigger: isQr ? LINK_EVENT_TRIGGER.qr : null,
    });
    await tx
      .update(linksTable)
      .set({
        clicks: incrementDBColumn(linksTable.clicks),
      })
      .where(eq(linksTable.id, linkId));
  });
}

export async function redirectLink(
  db: DrizzleDB,
  link: LinkWithRedirect,
  event: H3Event,
) {
  if (link.expDate && new Date().getTime() > new Date(link.expDate).getTime()) {
    if (!link.expUrl) {
      throw createError({
        statusCode: 403,
        statusMessage: 'This short link is expired',
      });
    }

    return link.expUrl;
  }

  const userAgent = event.headers.get('user-agent') ?? '';
  const uaParser = Bowser.getParser(userAgent, true);

  if (
    isbot(userAgent) ||
    !uaParser.getBrowserName() ||
    link.redirects.usage >= link.redirects.limit
  ) {
    return link.target;
  }

  const sessionId = await getSessionId(event);
  const sessionData = await getSessionData(event, sessionId);

  const redirectURL =
    LinkRulesTester.findMatchRules({ event, rules: link.rules, sessionData })
      ?.target ?? link.target;
  let redirectURLUTM = '';

  if (link.utmOptions) {
    const redirectURLObj = new URL(redirectURL);
    for (const _key in link.utmOptions) {
      const key = _key as keyof LinkUTMOptionsValidation;
      if (link.utmOptions[key]?.trim()) {
        redirectURLObj.searchParams.set(
          LINK_UTM_QUERY_MAP[key],
          link.utmOptions[key],
        );
      }
    }

    redirectURLUTM = redirectURLObj.href;
  }

  db.update(userPlansTable)
    .set({
      redirectsUsage: incrementDBColumn(userPlansTable.redirectsUsage),
    })
    .where(eq(userPlansTable.id, link.redirects.id))
    .execute();
  insertLinkSession(
    db,
    { linkId: link.id, userId: link.userId },
    { ...sessionData, targetURL: redirectURL },
  );

  return linkVariableReplacer(redirectURLUTM || redirectURL, sessionData);
}
