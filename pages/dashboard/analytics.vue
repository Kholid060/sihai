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
  <div class="mt-8 grid gap-8 pb-24 lg:grid-cols-2">
    <UiCard class="min-h-80">
      <UiTabs v-model="tabsState.links">
        <UiCardHeader
          class="w-full flex-row items-center justify-between overflow-auto"
        >
          <UiTabsList class="w-auto">
            <UiTabsTrigger value="links">Links</UiTabsTrigger>
            <UiTabsTrigger value="destinations">Destinations</UiTabsTrigger>
          </UiTabsList>
          <div
            class="hidden rounded-sm bg-background px-1.5 py-1 text-sm text-muted-foreground md:block"
          >
            <MousePointerClickIcon class="inline size-5 align-bottom" />
            <span class="ml-1">clicks</span>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <UiTabsContent value="links">
            <AnalyticClicksLinks :interval="interval" />
          </UiTabsContent>
          <UiTabsContent value="destinations">
            <AnalyticClicksDestinations :interval="interval" />
          </UiTabsContent>
        </UiCardContent>
      </UiTabs>
    </UiCard>
    <UiCard class="min-h-80">
      <UiTabs v-model="tabsState.countryLang">
        <UiCardHeader class="flex-row items-center justify-between">
          <UiTabsList class="w-auto">
            <UiTabsTrigger value="countries">Countries</UiTabsTrigger>
            <UiTabsTrigger value="languages">Languages</UiTabsTrigger>
          </UiTabsList>
          <div
            class="hidden rounded-sm bg-background px-1.5 py-1 text-sm text-muted-foreground md:block"
          >
            <MousePointerClickIcon class="inline size-5 align-bottom" />
            <span class="ml-1">clicks</span>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <UiTabsContent value="countries">
            <AnalyticClicksCountries :interval="interval" />
          </UiTabsContent>
          <UiTabsContent value="languages">
            <AnalyticClicksLanguages :interval="interval" />
          </UiTabsContent>
        </UiCardContent>
      </UiTabs>
    </UiCard>
    <UiCard class="min-h-80">
      <UiTabs v-model="tabsState.device">
        <UiCardHeader class="flex-row items-center justify-between">
          <UiTabsList class="w-auto">
            <UiTabsTrigger value="devices">Devices</UiTabsTrigger>
            <UiTabsTrigger value="os">OS</UiTabsTrigger>
            <UiTabsTrigger value="browser">Browser</UiTabsTrigger>
          </UiTabsList>
          <div
            class="hidden rounded-sm bg-background px-1.5 py-1 text-sm text-muted-foreground md:block"
          >
            <MousePointerClickIcon class="inline size-5 align-bottom" />
            <span class="ml-1">clicks</span>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <UiTabsContent value="devices">
            <AnalyticClicksDevice :interval="interval" />
          </UiTabsContent>
          <UiTabsContent value="os">
            <AnalyticClicksOS :interval="interval" />
          </UiTabsContent>
          <UiTabsContent value="browser">
            <AnalyticClicksBrowser :interval="interval" />
          </UiTabsContent>
        </UiCardContent>
      </UiTabs>
    </UiCard>
    <UiCard class="min-h-80">
      <UiTabs v-model="tabsState.ref">
        <UiCardHeader class="flex-row items-center justify-between">
          <UiTabsList class="w-auto">
            <UiTabsTrigger value="referrers">Referrers</UiTabsTrigger>
            <UiTabsTrigger value="triggers">Triggers</UiTabsTrigger>
          </UiTabsList>
          <div
            class="hidden rounded-sm bg-background px-1.5 py-1 text-sm text-muted-foreground md:block"
          >
            <MousePointerClickIcon class="inline size-5 align-bottom" />
            <span class="ml-1">clicks</span>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <UiTabsContent value="referrers">
            <AnalyticClicksReferrers :interval="interval" />
          </UiTabsContent>
          <UiTabsContent value="triggers">
            <AnalyticClicksTriggers :interval="interval" />
          </UiTabsContent>
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
};

const interval = shallowRef<AnalyticsInterval>('24h');
const tabsState = shallowReactive({
  links: 'links',
  ref: 'referrers',
  device: 'devices',
  countryLang: 'countries',
});
</script>
