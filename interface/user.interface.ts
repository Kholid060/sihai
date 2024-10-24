import type { SelectPlan, SelectUser, SelectUserUsage } from '~/db/schema';

export interface UserProfile extends Pick<SelectUser, 'id' | 'name' | 'email'> {
  avatarUrl?: string;
  plan: Pick<SelectPlan, 'maxRedirect' | 'maxRules' | 'maxUrl' | 'name'>;
  usage: Pick<SelectUserUsage, 'periodEnd' | 'redirectCounts' | 'urlCounts'>;
}
