<template>
  <UiDropdownMenu>
    <slot />
    <UiDropdownMenuContent
      class="text-sm"
      side="top"
      :class="sameWidthContent ? 'dropdown-trigger-width' : ''"
      :side-offset="10"
      v-bind="contentProps"
    >
      <UiDropdownMenuItem as-child>
        <NuxtLink to="/dashboard/settings/account">
          <UserRoundIcon class="mr-2 size-4" />
          Account
        </NuxtLink>
      </UiDropdownMenuItem>
      <UiDropdownMenuItem as-child>
        <NuxtLink to="/dashboard/settings/billing">
          <GaugeIcon class="mr-2 size-4" />
          Usage
        </NuxtLink>
      </UiDropdownMenuItem>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem
        class="text-destructive focus:text-destructive"
        @click="signOut"
      >
        <LogOutIcon class="mr-2 size-4" />
        Sign out
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
<script setup lang="ts">
import { GaugeIcon, LogOutIcon, UserRoundIcon } from 'lucide-vue-next';
import { useToast } from '../ui/toast';
import type { DropdownMenuContentProps } from 'radix-vue';

defineProps<{
  sameWidthContent?: boolean;
  contentProps?: DropdownMenuContentProps;
}>();

const toast = useToast();
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
