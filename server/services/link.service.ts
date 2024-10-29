import { linksTable, userUsagesTable } from '~/db/schema';
import { drizzle } from '../lib/drizzle';
import { createLimitExceedError } from '../utils/custom-errors';
import type {
  LinkQueryValidation,
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
} from '~/interface/link.interface';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import postgres from 'postgres';
import { LINK_QUERY_LIMIT } from '../const/link.const';

export async function createNewLink(
  userId: string,
  urlData: NewLinkValidation,
): Promise<LinkDetail> {
  const profile = await getUserProfile(userId);
  if (profile.usage.urlCounts >= profile.plan.maxUrl) {
    throw createLimitExceedError('URL');
  }
  if (urlData.rules.length >= profile.plan.maxRules) {
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
    await tx.update(userUsagesTable).set({
      urlCounts: incrementDBColumn(userUsagesTable.urlCounts),
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

export const findLinkById = defineCachedFunction(
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
    if (data.rules.length > profile.plan.maxRules) {
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
  const result = await drizzle
    .delete(linksTable)
    .where(and(eq(linksTable.id, linkId), eq(linksTable.userId, userId)))
    .returning({ id: linksTable.id });
  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
    });
  }
}
