import type { SelectLink } from '~/db/schema';

export type LinkDetail = Omit<SelectLink, 'userId'>;

export type LinkListItem = Pick<
  SelectLink,
  'id' | 'key' | 'createdAt' | 'title' | 'clicks'
>;
