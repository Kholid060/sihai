<template>
  <DashboardHeading>Links</DashboardHeading>
  <div class="mt-10 flex items-center">
    <div
      class="inline-flex h-10 items-center rounded-md border bg-secondary shadow-sm"
    >
      <button
        class="h-full w-11 shrink-0 rounded-l-md px-2 transition hover:bg-secondary-hover"
        @click="sortBy.asc = !sortBy.asc"
      >
        <component
          :is="sortBy.asc ? ArrowDownAzIcon : ArrowUpAzIcon"
          class="-ml-2 inline-block size-5 align-sub"
        />
      </button>
      <UiSelect v-model="sortBy.key">
        <UiSelectTrigger class="-ml-2 border-r-0 shadow-none">
          <UiSelectValue />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem
            v-for="item in sortKeys"
            :key="item.key"
            :value="item.key"
            >{{ item.label }}</UiSelectItem
          >
        </UiSelectContent>
      </UiSelect>
    </div>
    <UiPopover>
      <UiPopoverTrigger as-child>
        <UiButton variant="secondary" class="ml-4">
          <ListFilterIcon class="-ml-1 mr-2 size-5" />
          Filters
        </UiButton>
      </UiPopoverTrigger>
      <UiPopoverContent> Hello world </UiPopoverContent>
    </UiPopover>
    <div class="grow"></div>
    <div class="relative">
      <SearchIcon
        class="pointer-events-none absolute left-2.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <UiInput placeholder="Search..." type="search" class="w-64 pl-9" />
    </div>
    <UiDialog v-model:open="showNewLinkModal" modal>
      <UiDialogTrigger>
        <UiButton class="ml-4">Create link</UiButton>
      </UiDialogTrigger>
      <UiDialogScrollContent
        blur
        hide-close-btn
        class="flex !w-auto max-w-none p-2"
      >
        <LazyDashboardNewLink @new-link="onNewLinkCreated" />
      </UiDialogScrollContent>
    </UiDialog>
  </div>
  <UiCard class="mt-6">
    <UiCardHeader>halo</UiCardHeader>
    <UiCardContent>halo</UiCardContent>
  </UiCard>
</template>
<script setup lang="ts">
import {
  SearchIcon,
  ArrowDownAzIcon,
  ArrowUpAzIcon,
  ListFilterIcon,
} from 'lucide-vue-next';
import type { LinkDetail } from '~/interface/link.interface';
import { LINKS_SORT_BY, type LinksSortBy } from '~/server/const/link.const';

const sortKeys: { key: LinksSortBy; label: string }[] = [
  { key: 'created-at', label: 'Created Date' },
  { key: 'clicks-count', label: 'Clicks Count' },
];

const sortBy = shallowReactive<{ key: LinksSortBy; asc: boolean }>({
  asc: false,
  key: LINKS_SORT_BY.createdAt,
});
const showNewLinkModal = shallowRef(false);

const { refresh } = useAsyncData(() => $fetch('/api/links', {  }));

function onNewLinkCreated(link: LinkDetail) {
  showNewLinkModal.value = false;
  navigateTo(`/links/${link.id}`);
}
</script>
