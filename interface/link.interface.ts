import type { SelectLink } from '~/db/schema';

export type LinkDetail = Omit<
  SelectLink,
  'userId' | 'updatedAt' | 'expUrl' | 'expDate'
>;

export type LinkListItem = Pick<
  SelectLink,
  'id' | 'key' | 'createdAt' | 'title' | 'clicks' | 'target'
>;

export interface LinkListResult {
  items: LinkListItem[];
  nextCursor: string | null;
}

export type LinkWithRedirect = Pick<
  SelectLink,
  'rules' | 'utmOptions' | 'target' | 'id' | 'userId' | 'expDate' | 'expUrl'
> & {
  redirects: { usage: number; limit: number; id: number };
};

export type LinkVariableList =
  | 'os'
  | 'time'
  | 'date'
  | 'device'
  | 'browser'
  | 'country'
  | 'date-time'
  | 'language';
