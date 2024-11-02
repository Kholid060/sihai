import type { H3Event } from 'h3';
import Bowser from 'bowser';
import { isbot } from 'isbot';
import {
  linkEventsTable,
  linkSessionsTable,
  linksTable,
  userPlansTable,
} from '~/db/schema';
import { drizzle } from '../lib/drizzle';
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

export async function createNewLink(
  userId: string,
  urlData: NewLinkValidation,
): Promise<LinkDetail> {
  const profile = await getUserProfile(userId);
  if (profile.plan.linksUsage >= profile.plan.linksLimit) {
    throw createLimitExceedError('URL');
  }
  if (urlData.rules.length >= profile.plan.rulesLimit) {
    throw createLimitExceedError('Link rule');
  }

  const newLink = await drizzle.transaction(async (tx) => {
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
    await tx.update(userPlansTable).set({
      linksUsage: incrementDBColumn(userPlansTable.linksUsage),
    });

    return result as LinkDetail;
  });

  // @ts-expect-error unused property
  delete newLink.userId;

  return newLink;
}

export async function findLinksByUser(
  userId: string,
  filter: LinkQueryValidation,
): Promise<LinkListResult> {
  let query = drizzle
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

export async function findLinkByKey(key: string): Promise<LinkWithRedirect> {
  const [link] = await drizzle
    .select({
      id: linksTable.id,
      rules: linksTable.rules,
      userId: linksTable.userId,
      target: linksTable.target,
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
}

export const findLinkByUserAndId = defineCachedFunction(
  async (userId: string, linkId: string): Promise<LinkDetail> => {
    const [link] = await drizzle
      .select({
        id: linksTable.id,
        key: linksTable.key,
        title: linksTable.title,
        rules: linksTable.rules,
        clicks: linksTable.clicks,
        target: linksTable.target,
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
  { maxAge: 5 },
);

export async function updateLink(
  userId: string,
  linkId: string,
  data: UpdateLinkValidation,
) {
  if (Object.keys(data).length === 0) return;

  if (data.rules) {
    const profile = await getUserProfile(userId);
    if (data.rules.length > profile.plan.rulesLimit) {
      throw createLimitExceedError('Link rule');
    }
  }

  const result = await drizzle
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

export async function deleteLink(userId: string, linkId: string) {
  await drizzle.transaction(async (tx) => {
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

    await drizzle
      .delete(linkSessionsTable)
      .where(eq(linkSessionsTable.linkId, linkId));
    await drizzle
      .delete(linkEventsTable)
      .where(eq(linkEventsTable.linkId, linkId));
  });
}

async function insertLinkSession(
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
  await drizzle.transaction(async (tx) => {
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
  });
}

export async function redirectLink(link: LinkWithRedirect, event: H3Event) {
  if (link.redirects.usage >= link.redirects.limit) {
    throw createError({
      statusCode: 402,
      statusMessage: 'The redirect limit has been exceeded',
    });
  }

  const userAgent = event.headers.get('user-agent') ?? '';
  const uaParser = Bowser.getParser(userAgent, true);

  if (isbot(userAgent) || !uaParser.getBrowserName()) {
    return sendRedirect(event, link.target);
  }

  const sessionId = await getSessionId(event);
  const sessionData = await getSessionData(event, sessionId);

  const redirectURL =
    LinkRulesTester.findMatchRules({ event, rules: link.rules, sessionData })
      ?.target ?? link.target;
  let redirectURLWithUtm: string | null = null;

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

    redirectURLWithUtm = redirectURLObj.href;
  }

  drizzle
    .update(userPlansTable)
    .set({
      redirectsUsage: incrementDBColumn(userPlansTable.redirectsUsage),
    })
    .where(eq(userPlansTable.id, link.redirects.id))
    .execute();
  insertLinkSession(
    { linkId: link.id, userId: link.userId },
    { ...sessionData, targetURL: redirectURL },
  );

  return sendRedirect(event, redirectURLWithUtm || redirectURL);
}
