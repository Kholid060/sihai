<template>
  <UiCard>
    <UiCardHeader class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <section>
        <p class="mb-1 text-sm text-muted-foreground">Plan</p>
        <h3 class="text-xl font-semibold capitalize">
          {{ userStore.profile.plan.name }}
        </h3>
      </section>
      <section>
        <p class="mb-1 text-sm text-muted-foreground">Billing cycle</p>
        <h3 class="text-xl font-semibold">
          {{
            df.formatRange(
              new Date(userStore.profile.plan.periodStart),
              new Date(userStore.profile.plan.periodEnd),
            )
          }}
        </h3>
      </section>
      <section class="self-center md:justify-self-end">
        <UiButton>Upgrade</UiButton>
      </section>
    </UiCardHeader>
    <UiCardContent>
      <div class="overflow-hidden rounded-lg border">
        <div class="divide-y border-b md:flex md:divide-x md:divide-y-0">
          <button
            v-for="tab in usageTabs"
            :key="tab.id"
            class="relative w-full gap-2 px-6 py-4 pl-10 text-left transition-colors hover:bg-background md:w-auto"
            @click="activeUsageTab = tab.id"
          >
            <div
              class="absolute left-6 top-1/2 h-10 w-1.5 -translate-y-1/2 rotate-180 rounded-full bg-secondary"
            >
              <div
                class="rounded-full bg-primary"
                :style="{
                  height:
                    Math.min(
                      (userStore.profile.plan[tab.usageKey] /
                        userStore.profile.plan[tab.maxKey]) *
                        100,
                      100,
                    ) + '%',
                }"
              ></div>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ tab.name }}
            </p>
            <p class="font-serif text-xl font-semibold">
              {{ nf.format(userStore.profile.plan[tab.usageKey]) }} of
              {{ nf.format(userStore.profile.plan[tab.maxKey]) }}
            </p>
            <div
              :style="{ height: activeUsageTab === tab.id ? '8px' : '0px' }"
              style="transition: height 200ms ease"
              class="absolute bottom-0 left-0 w-full bg-primary"
            ></div>
          </button>
        </div>
        <div class="min-h-[400px] p-4">
          <UiStateError
            v-if="query.status.value === 'error'"
            title="Error fetching usage data"
          >
            <UiButton class="mt-6 min-w-32" variant="secondary">Retry</UiButton>
          </UiStateError>
          <UiSkeleton
            v-else-if="query.status.value === 'pending' || !query.data.value"
            class="min-h-[400px] w-full"
          />
          <UiBarChart
            v-else
            :data="chartData"
            index="label"
            :show-legend="false"
            :categories="['events']"
            :y-formatter="
              (tick) => {
                return typeof tick === 'number'
                  ? nf.format(tick).toString()
                  : '';
              }
            "
          />
          <p
            v-if="activeUsageTab === 'links'"
            class="mt-4 text-right text-sm text-muted-foreground"
          >
            *This chart only shows links that are not deleted
          </p>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
<script setup lang="ts">
import { DateFormatter } from '@internationalized/date';
import { useQuery } from '@tanstack/vue-query';
import { LinkIcon, SignpostIcon } from 'lucide-vue-next';

useSeoMeta({
  title: 'Plan & Usage',
});

const usageTabs = [
  {
    id: 'redirects',
    name: 'Redirects',
    icon: SignpostIcon,
    maxKey: 'redirectsLimit',
    usageKey: 'redirectsUsage',
  },
  {
    id: 'links',
    icon: LinkIcon,
    maxKey: 'linksLimit',
    name: 'Links created',
    usageKey: 'linksUsage',
  },
] as const;

const df = new DateFormatter(useDefaultLocale().value, {
  dateStyle: 'medium',
});
const nf = useNumberFormatter();

const userStore = useUserStore();

const activeUsageTab = shallowRef('redirects');

const query = useQuery({
  queryKey: ['user-usage', activeUsageTab],
  queryFn: () =>
    $fetch('/api/me/usage', {
      params: { type: activeUsageTab.value },
      headers: useRequestHeaders(['cookie']),
    }),
});
if (import.meta.server) {
  await query.suspense();
}

const chartData = computed(() => {
  if (!query.data.value) return [];

  const periodEndDate = new Date(userStore.profile.plan.periodEnd);
  const dayDiff = dateDiffInDays(
    new Date(userStore.profile.plan.periodStart),
    periodEndDate,
  );
  const timeSeries = generateTimeSeries(dayDiff, 'day', periodEndDate);

  const copyData = [...query.data.value.data];
  return timeSeries.map((date) => {
    const label = df.format(date);
    const index = copyData.findIndex((item) =>
      isSameDate(date, new Date(item.createdAt), 'date'),
    );
    if (index === -1) return { label, events: 0 };

    const events = copyData.splice(index, 1)[0].event;

    return { label, events };
  });
});
</script>
