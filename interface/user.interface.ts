import type { SelectUser, SelectUserPlan } from '~/db/schema';

export interface UserProfile extends Pick<SelectUser, 'id' | 'name' | 'email'> {
  avatarUrl?: string;
  plan: Pick<
    SelectUserPlan,
    | 'name'
    | 'periodEnd'
    | 'rulesLimit'
    | 'linksLimit'
    | 'linksUsage'
    | 'periodStart'
    | 'redirectsLimit'
    | 'redirectsUsage'
  >;
}
