import { linksTable, userUsagesTable } from '~/db/schema';
import { drizzle } from '../lib/drizzle';
import { createLimitExceedError } from '../utils/custom-errors';
import type {
  LinkQueryValidation,
  NewLinkValidation,
} from '../validation/link.validation';
import { getUserProfile } from './user.service';
import { nanoid } from 'nanoid';
import { incrementDBColumn } from '~/db/db-utils';
import type { LinkDetail, LinkListItem } from '~/interface/link.interface';
import { asc, desc, eq, ilike } from 'drizzle-orm';
import postgres from 'postgres';

export async function createNewLink(
  userId: string,
  urlData: NewLinkValidation,
): Promise<LinkDetail> {
  const profile = await getUserProfile(userId);
  if (profile.usage.urlCounts >= profile.plan.maxUrl) {
    throw createLimitExceedError('URL');
  }
  if (urlData.rules.length > profile.plan.maxRules) {
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
  filter: LinkQueryValidation = { sortAsc: false, sortBy: 'create-date' },
): Promise<LinkListItem[]> {
  const orderByTable =
    filter.sortBy === 'create-date' ? linksTable.createdAt : linksTable.clicks;

  let query = drizzle
    .select({
      id: linksTable.id,
      key: linksTable.key,
      title: linksTable.title,
      clicks: linksTable.clicks,
      createdAt: linksTable.createdAt,
    })
    .from(linksTable)
    .where(eq(linksTable.userId, userId))
    .orderBy(filter.sortAsc ? asc(orderByTable) : desc(orderByTable))
    .$dynamic();
  if (filter.q) {
    query = query.where(ilike(linksTable.title, `%${filter.q}%`)).limit(10);
  }

  return await query.execute();
}
