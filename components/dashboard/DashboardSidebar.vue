<template>
  <aside
    class="fixed top-0 flex h-screen w-64 flex-col bg-grass-12 py-4 text-olive-1"
  >
    <div class="mb-[46px] px-7 pt-4">
      <h2 class="text-3xl font-bold">Sihai</h2>
    </div>
    <NuxtLink
      v-for="link in sidebarLinks"
      :key="link.to"
      :to="link.to"
      active-class="active"
      class="sidebar-link group relative mb-3 px-4"
    >
      <span
        class="indicator absolute left-0 top-0 hidden h-full w-1.5 rounded-r-full bg-primary"
      ></span>
      <p
        class="flex items-center rounded-md p-2 text-olive-4 transition-colors hover:bg-white/10 hover:text-olive-1 group-hover:bg-white/10 group-hover:text-olive-1"
      >
        <component :is="link.icon" class="mr-3 size-5" />
        {{ link.label }}
      </p>
    </NuxtLink>
    <div class="grow"></div>
    <div class="px-4">
      <div
        class="min-h-12 w-full rounded-md border bg-secondary text-foreground shadow"
      >
        <UserDropDownMenu same-width-content>
          <UiDropdownMenuTrigger
            class="flex h-12 w-full items-center overflow-hidden rounded-md px-2 text-left transition-colors hover:bg-secondary-hover"
          >
            <UiAvatar class="size-8 bg-secondary-hover">
              <UiAvatarImage :src="userStore.profile.avatarUrl ?? ''" />
              <UiAvatarFallback>
                <UserRoundIcon />
              </UiAvatarFallback>
            </UiAvatar>
            <div class="ml-2 grow overflow-hidden pr-6 text-sm">
              <p class="truncate">{{ userStore.profile.name }}</p>
              <p class="truncate text-xs text-muted-foreground">
                {{ userStore.profile.email }}
              </p>
            </div>
            <ChevronsUpDownIcon class="absolute right-6 size-5 shrink-0" />
          </UiDropdownMenuTrigger>
        </UserDropDownMenu>
        <div class="border-t p-2 text-sm text-muted-foreground">
          <div class="text-xs">
            <div class="flex justify-between">
              <p>Links</p>
              <p>
                {{ userStore.profile.plan.linksUsage }}/{{
                  userStore.profile.plan.linksLimit
                }}
              </p>
            </div>
            <UiProgress
              class="h-2 bg-secondary-active"
              :model-value="
                Math.min(
                  (userStore.profile.plan.linksUsage /
                    userStore.profile.plan.linksLimit) *
                    100,
                  100,
                )
              "
            />
          </div>
          <div class="mt-2.5 text-xs">
            <div class="flex justify-between">
              <p>Redirects</p>
              <p>
                {{ userStore.profile.plan.redirectsUsage }}/{{
                  userStore.profile.plan.redirectsLimit
                }}
              </p>
            </div>
            <UiProgress
              class="h-2 bg-secondary-active"
              :model-value="
                Math.min(
                  (userStore.profile.plan.redirectsUsage /
                    userStore.profile.plan.redirectsLimit) *
                    100,
                  100,
                )
              "
            />
          </div>
          <NuxtLink
            to="/dashboard/settings/billing"
            class="mt-3 inline-block text-xs hover:underline"
          >
            Usage will reset in
            {{
              df.custom(new Date(userStore.profile.plan.periodEnd), {
                dateStyle: 'medium',
              })
            }}
            <ChevronRightIcon class="inline size-4 align-sub" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import {
  LinkIcon,
  SettingsIcon,
  ChartColumnIcon,
  ChevronRightIcon,
  UserRoundIcon,
  ChevronsUpDownIcon,
} from 'lucide-vue-next';
import { useDateFormatter } from 'radix-vue';

const userStore = useUserStore();
const locale = useDefaultLocale();
const df = useDateFormatter(locale.value);

const sidebarLinks = [
  { to: '/dashboard/links', icon: LinkIcon, label: 'Links' },
  { to: '/dashboard/analytics', icon: ChartColumnIcon, label: 'Analytics' },
  { to: '/dashboard/settings', icon: SettingsIcon, label: 'Settings' },
];
</script>
<style lang="postcss" scoped>
.sidebar-link.active {
  .indicator {
    display: block;
  }
  p {
    @apply bg-white/10;
    color: theme('colors.olive.1');
  }
  svg {
    color: theme('colors.primary.DEFAULT');
  }
}
</style>
