<template>
  <ul class="space-y-1">
    <div v-if="query.status.value === 'error'">
      <UiStateError title="Error fetching data">
        <UiButton variant="secondary" @click="query.refetch">Retry</UiButton>
      </UiStateError>
    </div>
    <template v-else-if="query.status.value === 'pending' || !query.data.value">
      <li v-for="i in 5" :key="i">
        <UiSkeleton class="h-9 w-full" />
      </li>
    </template>
    <template v-else-if="query.status.value === 'success'">
      <li v-if="query.data.value.length === 0">
        <p class="text-center text-muted-foreground">No data</p>
      </li>
      <li
        v-for="(item, index) in query.data.value"
        :key="item.label"
        class="flex h-9 items-center rounded-sm px-2 hover:bg-background"
        :class="index % 2 === 1 ? 'bg-background/50' : ''"
      >
        <span class="aspect-video h-4 text-center">
          <GlobeIcon v-if="!item.label" class="size-5 text-muted-foreground" />
          <img
            v-else
            class="mx-auto h-4 object-contain"
            :src="`/images/browser/${item.label}.png`"
          />
        </span>
        <p class="ml-2 grow truncate">
          {{ Bowser.BROWSER_MAP[item.label] ?? '(unknown)' }}
        </p>
        <span class="font-semibold">
          {{ numberFormatter.format(item.event) }}
        </span>
      </li>
    </template>
  </ul>
</template>
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import type { AnalyticsInterval } from '~/server/const/analytics.const';
import Bowser from 'bowser';

const props = defineProps<{ interval: AnalyticsInterval }>();
const query = useQuery({
  queryKey: computed(() => ['analytics-click-browser', props.interval]),
  queryFn: () =>
    $fetch('/api/analytics', {
      params: { interval: props.interval, groupBy: 'browser' },
      headers: useRequestHeaders(['cookie']),
    }),
});
await query.suspense();

const numberFormatter = useNumberFormatter();
</script>
