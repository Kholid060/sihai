<template>
  <DashboardHeading>Analytics</DashboardHeading>
  <div class="mt-10 flex gap-4">
    <UiSelect v-model="searchParams.interval">
      <UiSelectTrigger class="w-auto">
        <CalendarDaysIcon class="mr-2 size-4 text-muted-foreground" />
        <UiSelectValue />
      </UiSelectTrigger>
      <UiSelectContent>
        <UiSelectItem v-for="(label, key) in intervals" :key="key" :value="key">
          {{ label }}
        </UiSelectItem>
      </UiSelectContent>
    </UiSelect>
    <div
      v-if="searchParams.linkId && searchParams.linkKey"
      class="inline-flex h-10 items-center rounded-md border bg-secondary px-4 text-sm shadow-sm"
    >
      Link
      <span class="mx-1.5 font-semibold text-muted-foreground">is</span>
      <span class="max-w-md truncate"> /{{ searchParams.linkKey }} </span>
      <button
        class="-mr-1 ml-2 rounded-full bg-secondary-hover p-1 transition-colors hover:bg-secondary-active"
        @click="
          searchParams.linkId = undefined;
          searchParams.linkKey = undefined;
        "
      >
        <XIcon class="size-4" />
      </button>
    </div>
  </div>
  <ClientOnly>
    <template #fallback>
      <div class="min-h-[550px]"></div>
    </template>
    <AnalyticClicks
      :interval="searchParams.interval"
      :link-id="searchParams.linkId"
      class="mt-6"
    />
  </ClientOnly>
  <div class="mt-6 grid gap-6 pb-24 lg:grid-cols-2">
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
            <AnalyticClicksLinks
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              @selected="
                searchParams.linkId = $event.id;
                searchParams.linkKey = $event.key;
              "
            />
          </UiTabsContent>
          <UiTabsContent value="destinations">
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="target"
            />
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
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="country"
              :label-formatter="
                (item) => countries[item.label as keyof typeof countries]
              "
            >
              <template #item:prefix="{ item }">
                <span class="aspect-video h-4 text-center">
                  <GlobeIcon
                    v-if="!item.label"
                    class="mx-auto size-5 text-muted-foreground"
                  />
                  <img
                    v-else
                    class="mx-auto h-4"
                    :src="`/flags/${item.label.toLowerCase()}.svg`"
                  />
                </span>
              </template>
            </AnalyticListData>
          </UiTabsContent>
          <UiTabsContent value="languages">
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="language"
              :label-formatter="
                (item) => languages[item.label as keyof typeof languages]
              "
            />
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
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="device"
            >
              <template #item:prefix="{ item }">
                <span class="aspect-video h-4 text-center">
                  <GlobeIcon
                    v-if="!item.label"
                    class="size-5 text-muted-foreground"
                  />
                  <img
                    v-else
                    class="mx-auto h-4"
                    :src="`/images/device/${item.label.toLowerCase()}.png`"
                  />
                </span>
              </template>
            </AnalyticListData>
          </UiTabsContent>
          <UiTabsContent value="os">
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="os"
            >
              <template #item:prefix="{ item }">
                <span class="aspect-video h-4 text-center">
                  <GlobeIcon
                    v-if="!item.label"
                    class="size-5 text-muted-foreground"
                  />
                  <img
                    v-else
                    class="mx-auto h-4 object-contain"
                    :src="`/images/os/${item.label.toLowerCase()}.png`"
                  />
                </span>
              </template>
            </AnalyticListData>
          </UiTabsContent>
          <UiTabsContent value="browser">
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="browser"
              :label-formatter="(item) => Bowser.BROWSER_MAP[item.label]"
            >
              <template #item:prefix="{ item }">
                <span class="aspect-video h-4 text-center">
                  <GlobeIcon
                    v-if="!item.label"
                    class="size-5 text-muted-foreground"
                  />
                  <img
                    v-else
                    class="mx-auto h-4 object-contain"
                    :src="`/images/browser/${item.label}.png`"
                  />
                </span>
              </template>
            </AnalyticListData>
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
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="referer"
              none-label="(none)"
            >
              <template #item:prefix="{ item }">
                <span class="aspect-video h-4 text-center">
                  <LinkIcon
                    v-if="!item.label"
                    class="mx-auto size-4 text-muted-foreground"
                  />
                  <img
                    v-else
                    class="mx-auto h-4"
                    :src="`https://www.google.com/s2/favicons?sz=32&domain_url=${item.label}`"
                  />
                </span>
              </template>
            </AnalyticListData>
          </UiTabsContent>
          <UiTabsContent value="triggers">
            <AnalyticListData
              :interval="searchParams.interval"
              :link-id="searchParams.linkId"
              group-by="trigger"
              none-label="(direct)"
            />
          </UiTabsContent>
        </UiCardContent>
      </UiTabs>
    </UiCard>
  </div>
</template>
<script setup lang="ts">
import {
  CalendarDaysIcon,
  GlobeIcon,
  LinkIcon,
  MousePointerClickIcon,
  XIcon,
} from 'lucide-vue-next';
import type { AnalyticsInterval } from '~/server/const/analytics.const';
import Bowser from 'bowser';
import countries from '~/data/country.json';
import languages from '~/data/language.json';
import { useUrlSearchParams } from '@vueuse/core';

interface SearchParams {
  linkId?: string;
  linkKey?: string;
  interval: AnalyticsInterval;
}

const intervals: Record<AnalyticsInterval, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '30d': 'Last 30 days',
};

useSeoMeta({
  title: 'Analytics',
});

const query = useRoute().query as unknown as SearchParams;
const searchParams = useUrlSearchParams<SearchParams>('history', {
  initialValue: {
    linkId: query.linkId,
    linkKey: query.linkKey,
    interval: intervals[query.interval] ? query.interval : '24h',
  },
});

if (query.interval && !intervals[query.interval]) {
  searchParams.interval = '24h';
}

const tabsState = shallowReactive({
  links: 'links',
  ref: 'referrers',
  device: 'devices',
  countryLang: 'countries',
});
</script>
