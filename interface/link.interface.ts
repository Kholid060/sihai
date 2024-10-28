import type { SelectLink } from '~/db/schema';

export type LinkDetail = Omit<SelectLink, 'userId' | 'updatedAt'>;

export type LinkListItem = Pick<
  SelectLink,
  'id' | 'key' | 'createdAt' | 'title' | 'clicks' | 'target'
>;

export interface LinkListResult {
  items: LinkListItem[];
  nextCursor: string | null;
}
