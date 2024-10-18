import type { SelectUser } from '~/db/schema';

export interface UserProfile extends Pick<SelectUser, 'id' | 'name' | 'email'> {
  avatarUrl: string | null;
}
