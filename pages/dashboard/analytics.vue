<template>
  <DashboardHeading>Analytics</DashboardHeading>
  <div class="mt-10 flex">
    <UiSelect v-model="interval" placholder="Halo">
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
  <AnalyticClicks :interval="interval" class="mt-8" />
  <div class="mt-8 grid grid-cols-2">
    <UiCard class="min-h-80">
      <UiTabs>
        <UiCardHeader class="flex-row items-center justify-between">
          <UiTabsList class="w-auto">
            <UiTabsTrigger value="countries">Countries</UiTabsTrigger>
            <UiTabsTrigger value="languages">Languages</UiTabsTrigger>
          </UiTabsList>
          <div
            class="rounded-sm bg-background px-1.5 py-1 text-sm text-muted-foreground"
          >
            <MousePointerClickIcon class="inline size-5 align-bottom" />
            <span class="ml-1">clicks</span>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <AnalyticClicksCountries :interval="interval" />
        </UiCardContent>
      </UiTabs>
    </UiCard>
  </div>
</template>
<script setup lang="ts">
import { CalendarDaysIcon, MousePointerClickIcon } from 'lucide-vue-next';
import type { AnalyticsInterval } from '~/server/const/analytics.const';

const periods: Record<AnalyticsInterval, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

const interval = shallowRef<AnalyticsInterval>('24h');
</script>
