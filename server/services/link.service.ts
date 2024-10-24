import { linksTable, userUsagesTable } from '~/db/schema';
import { drizzle } from '../lib/drizzle';
import { createLimitExceedError } from '../utils/custom-errors';
import type { NewLinkValidation } from '../validation/link.validation';
import { getUserProfile } from './user.service';
import { nanoid } from 'nanoid';
import { incrementDBColumn } from '~/db/db-utils';
import type { LinkDetail } from '~/interface/link.interface';

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
    const [result] = await tx
      .insert(linksTable)
      .values({
        ...urlData,
        userId,
        key: urlData.key ?? nanoid(6),
      })
      .returning();
    await tx.update(userUsagesTable).set({
      urlCounts: incrementDBColumn(userUsagesTable.urlCounts),
    });

    return result as LinkDetail;
  });

  // @ts-expect-error unused property
  delete newLink.userId;

  return newLink;
}

export async function queryLinks() {}
