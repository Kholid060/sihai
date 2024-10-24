<template>
  <aside
    class="fixed top-0 flex h-screen w-64 flex-col bg-grass-12 py-4 text-olive-1"
  >
    <div class="mb-12 px-7 pt-4">
      <h2 class="text-2xl font-bold">App name</h2>
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
        <UiDropdownMenu>
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
            <ChevronDownIcon class="absolute right-6 size-5 shrink-0" />
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent
            class="dropdown-trigger-width text-sm"
            side="top"
            :side-offset="10"
          >
            <UiDropdownMenuItem
              class="text-destructive focus:text-destructive"
              @click="signOut"
            >
              <LogOutIcon class="mr-2 size-4" />
              Sign out
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import {
  UserRoundIcon,
  LogOutIcon,
  ChevronDownIcon,
  LinkIcon,
  ChartColumnIcon,
  SettingsIcon,
} from 'lucide-vue-next';
import { useToast } from '../ui/toast';

const toast = useToast();
const userStore = useUserStore();
const supabase = useSupabaseClient();

const sidebarLinks = [
  { to: '/dashboard', icon: LinkIcon, label: 'Links' },
  { to: '/dashboard/analytics', icon: ChartColumnIcon, label: 'Analytics' },
  { to: '/dashboard/settings', icon: SettingsIcon, label: 'Settings' },
];

async function signOut() {
  const result = await supabase.auth.signOut();
  if (result.error) {
    toast.toast({
      variant: 'destructive',
      title: 'An error occured',
      description: result.error.message,
    });
    return;
  }

  await navigateTo('/auth/login', { external: true });
}
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
