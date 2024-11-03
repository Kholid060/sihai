<template>
  <DashboardHeading>Analytics</DashboardHeading>
  <div class="mt-10 flex">
    <UiSelect v-model="period" placholder="Halo">
      <UiSelectTrigger class="w-auto">
        <CalendarDaysIcon class="mr-2 size-4 text-muted-foreground" />
        <UiSelectValue />
      </UiSelectTrigger>
      <UiSelectContent>
        <UiSelectItem v-for="(label, key) in periods" :key="key" :value="key">
          {{ label }}
        </UiSelectItem>
      </UiSelectContent>
    </UiSelect>
  </div>
  <AnalyticClicks :interval="period" class="mt-8" />
</template>
<script setup lang="ts">
import { CalendarDaysIcon } from 'lucide-vue-next';
import type { AnalyticsInterval } from '~/server/const/analytics.const';

const periods: Record<AnalyticsInterval, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

const period = shallowRef<AnalyticsInterval>('24h');
</script>
