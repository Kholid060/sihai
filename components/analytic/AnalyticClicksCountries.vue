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
        :class="index % 2 === 1 ? 'bg-background' : ''"
      >
        <span class="size-5">
          <GlobeIcon v-if="!item.label" class="size-5 text-muted-foreground" />
          <img
            v-else
            class="size-5"
            :src="`/flags/${item.label.toLowerCase()}.svg`"
          />
        </span>
        <p class="ml-2 grow truncate">
          {{ countries[item.label as keyof typeof countries] ?? '(unknown)' }}
        </p>
        <span class="font-semibold">
          {{ item.event }}
        </span>
      </li>
    </template>
  </ul>
</template>
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { GlobeIcon } from 'lucide-vue-next';
import type { AnalyticsInterval } from '~/server/const/analytics.const';
import countries from '~/data/country.json';

const props = defineProps<{ interval: AnalyticsInterval }>();
const query = useQuery({
  queryKey: computed(() => ['analytics-click-country', props.interval]),
  queryFn: () =>
    $fetch('/api/analytics', {
      params: { interval: props.interval, groupBy: 'country' },
      headers: useRequestHeaders(['cookie']),
    }),
});
await query.suspense();
</script>
