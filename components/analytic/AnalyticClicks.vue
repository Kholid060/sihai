<template>
  <UiCard class="mt-8">
    <div v-if="query.status.value === 'error'" class="p-6">
      <UiStateError title="Error fetching data">
        <UiButton variant="secondary" @click="query.refetch">Retry</UiButton>
      </UiStateError>
    </div>
    <template v-else>
      <UiCardHeader>
        <UiCardTitle class="font-normal">
          <UiSkeleton
            v-if="query.status.value === 'pending' || !query.data.value"
            class="h-7 w-32"
          />
          <span v-else>{{ chartData.totalClicks }} clicks</span>
        </UiCardTitle>
        <UiCardDescription>
          <UiSkeleton
            v-if="query.status.value === 'pending' || !query.data.value"
            class="h-4 w-48"
          />
          <span v-else>{{ intervalDescription }}</span>
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <UiSkeleton
          v-if="query.status.value === 'pending' || !query.data.value"
          class="min-h-[400px] w-full"
        />
        <UiAreaChart
          v-else
          :data="chartData.data"
          index="label"
          :show-legend="false"
          :categories="['clicks']"
          :y-formatter="
            (tick) => {
              return typeof tick === 'number'
                ? numberFormatter.format(tick).toString()
                : '';
            }
          "
        />
      </UiCardContent>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { DateFormatter } from '@internationalized/date';
import { useQuery } from '@tanstack/vue-query';
import {
  ANALYTICS_INTERVAL_DAY_COUNT,
  type AnalyticsInterval,
} from '~/server/const/analytics.const';

const props = defineProps<{ interval: AnalyticsInterval }>();

const query = useQuery({
  queryKey: computed(() => ['analytics-click', props.interval]),
  queryFn: () =>
    $fetch('/api/analytics/clicks', {
      params: { interval: props.interval },
      headers: useRequestHeaders(['cookie']),
    }),
});
if (import.meta.server) {
  await query.suspense();
}

const locale = useDefaultLocale();
const numberFormatter = useNumberFormatter(undefined, locale.value);
const df = new DateFormatter(locale.value, {
  dateStyle: 'medium',
});
const tf = new DateFormatter(locale.value, {
  timeStyle: 'short',
});

const chartData = computed(() => {
  if (!query.data.value) return { data: [], totalClicks: 0, is24Hours: false };

  const is24Hours = props.interval === '24h';
  const timeSeries = generateTimeSeries(
    is24Hours ? 24 : ANALYTICS_INTERVAL_DAY_COUNT[props.interval],
    is24Hours ? 'hour' : 'day',
  );

  let totalClicks = 0;

  const copyData = [...query.data.value];
  const data = timeSeries.map((date) => {
    const label = is24Hours ? tf.format(date) : df.format(date);
    const index = copyData.findIndex((item) =>
      isSameDate(date, new Date(item.createdAt), is24Hours ? 'hour' : 'date'),
    );
    if (index === -1) return { label, clicks: 0 };

    const clicks = copyData.splice(index, 1)[0].event;
    totalClicks += clicks;

    return { label, clicks };
  });

  return { totalClicks, data, is24Hours };
});
const intervalDescription = computed(() => {
  if (props.interval === '24h') return 'Last 24 hours';

  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(
    startDate.getDate() - ANALYTICS_INTERVAL_DAY_COUNT[props.interval],
  );
  return df.formatRange(startDate, endDate);
});
</script>
