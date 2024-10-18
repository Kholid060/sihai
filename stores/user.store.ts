import type { UserProfile } from '~/interface/user.interface';

export const useUserStore = defineStore('user', () => {
  let isFetched = false;

  const profile = shallowReactive<UserProfile>({
    id: '',
    name: '',
    email: '',
    avatarUrl: '',
  });

  async function fetch() {
    if (isFetched) return;

    const result = await $fetch('/api/me', {
      headers: useRequestHeaders(['cookie']),
    });

    isFetched = true;
    Object.assign(profile, result);
  }

  return { profile, fetch };
});
