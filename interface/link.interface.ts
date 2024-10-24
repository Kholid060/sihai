import type { SelectLink } from '~/db/schema';

export type LinkDetail = Omit<SelectLink, 'userId'>;
