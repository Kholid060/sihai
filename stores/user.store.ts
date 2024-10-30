import type { UserProfile } from '~/interface/user.interface';

export const useUserStore = defineStore('user', () => {
  let isFetched = false;

  const profile = reactive<UserProfile>({
    id: '',
    name: '',
    email: '',
    avatarUrl: '',
    plan: {
      name: '',
      periodEnd: '',
      linksLimit: 0,
      linksUsage: 0,
      rulesLimit: 0,
      redirectsLimit: 0,
      redirectsUsage: 0,
    },
  });

  async function fetch() {
    if (isFetched) return;

    const result = await $fetch('/api/me', {
      headers: useRequestHeaders(['cookie']),
    });

    isFetched = true;
    Object.assign(profile, result.data);
  }
  function incrementUsage(key: 'linksUsage' | 'redirectsUsage', by = 1) {
    profile.plan[key] += by;
  }

  return { profile, fetch, incrementUsage };
});
