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
        <p class="ml-2 grow truncate">/{{ item.label ?? '(unknown)' }}</p>
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

const props = defineProps<{ interval: AnalyticsInterval }>();
const query = useQuery({
  queryKey: computed(() => ['analytics-click-links', props.interval]),
  queryFn: () =>
    $fetch('/api/analytics/links', {
      params: { interval: props.interval },
      headers: useRequestHeaders(['cookie']),
    }),
});
await query.suspense();

const numberFormatter = useNumberFormatter();
</script>
