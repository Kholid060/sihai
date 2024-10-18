<template>
  <aside
    class="fixed top-0 flex h-screen w-64 flex-col bg-grass-12 p-4 text-olive-1"
  >
    <div class="grow"></div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="secondary"
          class="h-12 w-full overflow-hidden px-2 text-left"
        >
          <UiAvatar class="size-8">
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
        </UiButton>
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
  </aside>
</template>
<script setup lang="ts">
import { UserRoundIcon, LogOutIcon, ChevronDownIcon } from 'lucide-vue-next';
import { useToast } from '../ui/toast';

const toast = useToast();
const userStore = useUserStore();
const supabase = useSupabaseClient();

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
