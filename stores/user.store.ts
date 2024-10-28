import type { UserProfile } from '~/interface/user.interface';
import { APP_FREE_PLAN } from '~/server/const/app.const';

export const useUserStore = defineStore('user', () => {
  let isFetched = false;

  const profile = shallowReactive<UserProfile>({
    id: '',
    name: '',
    email: '',
    avatarUrl: '',
    plan: APP_FREE_PLAN,
    usage: { periodEnd: '', redirectCounts: 0, urlCounts: 0 },
  });

  async function fetch() {
    if (isFetched) return;

    const result = await $fetch('/api/me', {
      headers: useRequestHeaders(['cookie']),
    });

    isFetched = true;
    Object.assign(profile, result.data);
  }

  return { profile, fetch };
});
