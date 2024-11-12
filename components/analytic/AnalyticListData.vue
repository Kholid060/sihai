<template>
  <ul ref="containerRef" class="space-y-1">
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
        class="flex h-9 items-center rounded-sm px-2 transition-colors hover:bg-background"
        :class="index % 2 === 1 ? 'bg-background/50' : ''"
      >
        <slot name="item:prefix" :item="item" />
        <p class="ml-2 grow truncate">
          {{
            (labelFormatter ? labelFormatter(item) : item.label) ?? noneLabel
          }}
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
import { useElementVisibility } from '@vueuse/core';
import type { AnalyticsInterval } from '~/server/const/analytics.const';

interface Props {
  groupBy: string;
  linkId?: string;
  noneLabel?: string;
  interval: AnalyticsInterval;
  labelFormatter?: (item: { label: string; event: number }) => string;
}

const props = withDefaults(defineProps<Props>(), {
  noneLabel: '(unknown)',
});

const containerRef = ref<HTMLDivElement>();
const targetIsVisible = useElementVisibility(containerRef);

const query = useQuery({
  enabled: targetIsVisible,
  queryKey: computed(() => [
    `analytics-click-${props.groupBy}`,
    props.interval,
    props.linkId,
  ]),
  queryFn: () =>
    $fetch('/api/analytics', {
      headers: useRequestHeaders(['cookie']),
      params: {
        linkId: props.linkId,
        groupBy: props.groupBy,
        interval: props.interval,
      },
    }),
});

const numberFormatter = useNumberFormatter();
</script>
