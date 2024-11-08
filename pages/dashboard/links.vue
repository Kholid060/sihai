<template>
  <DashboardHeading>Links</DashboardHeading>
  <div class="mt-10 flex flex-wrap items-center gap-2 md:gap-4">
    <div class="flex grow gap-2 md:gap-4">
      <div
        class="inline-flex h-10 items-center rounded-md border bg-secondary shadow-sm"
      >
        <button
          class="h-full w-11 shrink-0 rounded-l-md px-2 transition hover:bg-secondary-hover"
          @click="sort.asc = !sort.asc"
        >
          <component
            :is="sort.asc ? ArrowDownAzIcon : ArrowUpAzIcon"
            class="-ml-2 inline-block size-5 align-sub"
          />
        </button>
        <UiSelect v-model="sort.by" class="grow lg:grow-0">
          <UiSelectTrigger class="-ml-2 border-r-0 shadow-none">
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem
              v-for="item in sortKeys"
              :key="item.key"
              :value="item.key"
            >
              {{ item.label }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
      <div class="relative">
        <SearchIcon
          class="pointer-events-none absolute left-2.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <UiInput
          v-model="search"
          placeholder="Search..."
          type="search"
          class="w-64 pl-9"
        />
      </div>
    </div>
    <UiDialog v-model:open="showNewLinkModal" modal>
      <UiDialogTrigger as-child>
        <UiButton
          :disabled="
            userStore.profile.plan.linksUsage >=
            userStore.profile.plan.linksLimit
          "
        >
          Create link
        </UiButton>
      </UiDialogTrigger>
      <UiDialogScrollContent
        blur
        hide-close-btn
        class="m-0 flex !w-auto max-w-none self-end p-0 md:self-auto md:p-2"
        @interact-outside="$event.preventDefault()"
      >
        <LazyDashboardNewLink @new-link="onNewLinkCreated" />
      </UiDialogScrollContent>
    </UiDialog>
  </div>
  <UiCard class="mt-6 overflow-hidden">
    <UiCardContent class="min-h-14 p-0">
      <ul
        v-if="query.status.value === 'pending'"
        class="divide-y divide-border/50"
      >
        <li v-for="i in 5" :key="i" class="flex min-h-14 items-center p-4">
          <UiSkeleton class="hidden size-6 rounded-full md:block" />
          <div class="grow md:pl-4">
            <UiSkeleton class="h-4 w-32 rounded-full" />
            <div class="mt-2 flex gap-2">
              <UiSkeleton class="h-3 w-14 rounded-full" />
              <UiSkeleton class="h-3 w-20 rounded-full" />
            </div>
          </div>
          <UiSkeleton class="h-6 w-20" />
          <UiSkeleton class="ml-4 size-9" />
        </li>
      </ul>
      <UiStateError
        v-else-if="query.status.value === 'error' && query.isError"
        class="pb-8"
        title="Something went wrong"
        description="Error when trying to fetch the links"
      >
        <UiButton
          :is-loading="query.isRefetchError.value"
          class="mt-8 min-w-24"
          @click="query.refetch()"
        >
          Retry
        </UiButton>
      </UiStateError>
      <ul
        v-else-if="query.status.value === 'success' && query.data.value"
        class="divide-y divide-border/50"
      >
        <template
          v-for="(page, index) in query.data.value?.pages ?? []"
          :key="index"
        >
          <li
            v-for="link in page.data.items"
            :key="link.id"
            class="flex min-h-14 items-center p-4 transition-colors hover:bg-grass-1"
          >
            <UiAvatar class="hidden size-6 md:block">
              <UiAvatarImage
                :src="`https://www.google.com/s2/favicons?sz=32&domain_url=${getURL(link.target, 'origin')}`"
              />
              <UiAvatarFallback>
                <GlobeIcon class="text-muted-foreground" />
              </UiAvatarFallback>
            </UiAvatar>
            <div class="grow truncate md:pl-4">
              <button
                class="w-full cursor-pointer truncate text-left"
                @click="editLinkId = link.id"
              >
                {{ link.title || getURL(link.target, 'hostname') }}
              </button>
              <div
                class="mt-0.5 flex items-center truncate text-sm text-muted-foreground"
              >
                <UiButton
                  class="size-6 shrink-0 rounded-sm px-0"
                  variant="ghost"
                  @click="copyShortLink(link.key)"
                >
                  <CopyIcon class="size-[14px]" />
                </UiButton>
                <a
                  :href="`https://${APP_DOMAIN}/${link.key}`"
                  target="_blank"
                  class="ml-1 hover:underline"
                  rel="noreferrer"
                >
                  {{ link.key }}
                </a>
                <MoveRightIcon class="mx-2 size-4 shrink-0" />
                <a
                  class="truncate hover:underline"
                  :href="link.target"
                  rel="noreferrer"
                >
                  {{ link.target }}
                </a>
              </div>
            </div>
            <UiTooltipSimple
              :label="
                dateFormatter.custom(new Date(link.createdAt), {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })
              "
            >
              <p class="hidden text-sm text-muted-foreground md:block">
                {{
                  dateFormatter.custom(new Date(link.createdAt), {
                    dateStyle: 'medium',
                  })
                }}
              </p>
            </UiTooltipSimple>
            <UiTooltipSimple :label="`${link.clicks} clicks`">
              <p
                class="ml-3 whitespace-nowrap rounded-sm bg-grass-4 px-1.5 py-0.5 text-sm"
              >
                <MousePointerClickIcon class="inline size-4 md:hidden" />
                {{ nf.format(link.clicks ?? 0) }}
                <span class="hidden md:inline">clicks</span>
              </p>
            </UiTooltipSimple>
            <UiDropdownMenu>
              <UiDropdownMenuTrigger as-child>
                <UiButton
                  variant="ghost"
                  size="icon-sm"
                  class="ml-2 shrink-0 text-muted-foreground md:ml-4"
                >
                  <EllipsisVerticalIcon class="size-5" />
                </UiButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent align="end">
                <UiDropdownMenuItem @click="editLinkId = link.id">
                  <PencilIcon class="mr-2 size-4" />
                  <span>Edit</span>
                </UiDropdownMenuItem>
                <UiDropdownMenuItem as-child>
                  <NuxtLink
                    :to="{
                      path: '/dashboard/analytics',
                      query: { linkKey: link.key, linkId: link.id },
                    }"
                  >
                    <ChartColumnIcon class="mr-2 size-4" />
                    <span>Analytics</span>
                  </NuxtLink>
                </UiDropdownMenuItem>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuItem
                  class="text-destructive data-[highlighted]:bg-destructive/20 data-[highlighted]:text-destructive"
                  @click="
                    deleteLinkState.id = link.id;
                    deleteLinkState.show = true;
                  "
                >
                  <TrashIcon class="mr-2 size-4" />
                  <span>Delete</span>
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </li>
        </template>
        <li v-if="query.hasNextPage.value" class="py-4 text-center">
          <UiButton
            variant="secondary"
            :is-loading="query.isFetchingNextPage.value"
            @click="query.fetchNextPage()"
          >
            Load more
          </UiButton>
        </li>
        <div
          v-if="query.data.value.pages[0]?.data.items.length === 0"
          class="flex min-h-80 flex-col items-center justify-center px-6"
        >
          <span class="rounded-full bg-background p-4">
            <LinkIcon class="size-5" />
          </span>
          <h3 class="mt-4 text-xl font-bold">
            {{ search ? 'Links not found' : 'No links yet' }}
          </h3>
          <p class="mt-1 text-muted-foreground">
            {{
              search
                ? 'The link you looking for does not exist'
                : 'Create a new link by clicking the "Create link" button'
            }}
          </p>
        </div>
      </ul>
    </UiCardContent>
    <UiDialog
      modal
      :open="Boolean(editLinkId)"
      @update:open="editLinkId = null"
    >
      <UiDialogScrollContent
        blur
        hide-close-btn
        class="m-0 flex !w-auto max-w-none self-end p-0 md:self-auto md:p-2"
        @interact-outside="$event.preventDefault()"
      >
        <LazyDashboardUpdateLink
          :link-id="editLinkId!"
          @updated="
            editLinkId = null;
            query.refetch();
          "
        />
      </UiDialogScrollContent>
    </UiDialog>
  </UiCard>
  <UiAlertDialog v-model:open="deleteLinkState.show">
    <UiAlertDialogContent>
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>Delete link?</UiAlertDialogTitle>
        <UiAlertDialogDescription>
          This action cannot be undone. This will permanently delete the link
          and all the data associated with it.
        </UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter>
        <UiAlertDialogCancel :disabled="deleteLinkState.loading">
          Cancel
        </UiAlertDialogCancel>
        <UiButton
          variant="destructive"
          :is-loading="deleteLinkState.loading"
          @click="deleteLink"
        >
          Delete link
        </UiButton>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import {
  SearchIcon,
  ArrowDownAzIcon,
  ArrowUpAzIcon,
  GlobeIcon,
  CopyIcon,
  MoveRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  MousePointerClickIcon,
  LinkIcon,
  ChartColumnIcon,
} from 'lucide-vue-next';
import { APP_DOMAIN } from '~/server/const/app.const';
import type { LinkQueryValidation } from '~/server/validation/link.validation';
import { useToast } from '~/components/ui/toast';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useDateFormatter } from 'radix-vue';

const sortKeys: { key: LinkQueryValidation['sortBy']; label: string }[] = [
  { key: 'create-date', label: 'Created Date' },
  { key: 'clicks', label: 'Clicks Count' },
];

const toast = useToast();
const locale = useDefaultLocale();
const dateFormatter = useDateFormatter(locale.value);

const userStore = useUserStore();

const nf = new Intl.NumberFormat(locale.value, {
  notation: 'compact',
  maximumSignificantDigits: 3,
});

const search = shallowRef('');
const searchDebounce = refDebounced(search, 500);

const sort = shallowReactive<{
  asc: boolean;
  by: LinkQueryValidation['sortBy'];
}>({
  asc: true,
  by: 'create-date',
});

const deleteLinkState = shallowReactive<{
  id: string;
  show: boolean;
  loading: boolean;
}>({
  id: '',
  show: false,
  loading: false,
});

const showNewLinkModal = shallowRef(false);
const editLinkId = shallowRef<string | null>(null);

const query = useInfiniteQuery({
  refetchInterval: false,
  refetchOnWindowFocus: false,
  queryKey: ['links', searchDebounce, sort],
  queryFn: ({ pageParam }) =>
    $fetch('/api/links', {
      headers: useRequestHeaders(['cookie']),
      params: {
        sortBy: sort.by,
        sortAsc: sort.asc,
        q: search.value || undefined,
        nextCursor: pageParam || undefined,
      },
    }),
  getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  initialPageParam: '',
});
await query.suspense();

function onNewLinkCreated() {
  showNewLinkModal.value = false;
  setTimeout(() => {
    query.refetch();
  }, 1000);
  userStore.incrementUsage('linksUsage');
}
function getURL(url: string, key: keyof URL) {
  return new URL(url)[key];
}
async function copyShortLink(key: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([`https://${APP_DOMAIN}/${key}`], {
          type: 'text/plain',
        }),
      }),
    ]);
    toast.toast({
      title: 'Copied to clipboard',
    });
  } catch (error) {
    console.error(error);
    toast.toast({
      variant: 'destructive',
      title: 'Error copying URL',
    });
  }
}
async function deleteLink() {
  try {
    deleteLinkState.loading = true;
    await $fetch(`/api/links/${deleteLinkState.id}`, { method: 'DELETE' });

    deleteLinkState.id = '';
    deleteLinkState.show = false;
    query.refetch();
  } catch (error) {
    console.error(error);
    toast.toast({
      variant: 'destructive',
      title: 'Error deleting link',
    });
  } finally {
    deleteLinkState.loading = false;
  }
}
</script>
