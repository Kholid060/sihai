import type { UserProfile } from '~/interface/user.interface';
import { APP_FREE_PLAN } from '~/server/const/app.const';

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
      periodStart: '',
      redirectsLimit: 0,
      redirectsUsage: 0,
    },
  });

  const isFreePlan = computed(
    () => !profile.plan.name || profile.plan.name === APP_FREE_PLAN.id,
  );

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
  function updateProfile(data: Partial<Pick<UserProfile, 'name' | 'email'>>) {
    Object.assign(profile, data);
  }

  return { profile, fetch, incrementUsage, updateProfile, isFreePlan };
});
