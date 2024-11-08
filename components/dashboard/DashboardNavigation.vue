<template>
  <header class="h-14 bg-grass-12 text-grass-2 lg:hidden">
    <nav class="container flex h-full items-center justify-between">
      <button class="size-9" aria-label="menu" @click="$emit('menu')">
        <MenuIcon />
      </button>
      <UserDropDownMenu :content-props="{ align: 'end' }">
        <UiDropdownMenuTrigger>
          <UiAvatar class="size-8 bg-secondary-hover">
            <UiAvatarImage :src="userStore.profile.avatarUrl ?? ''" />
            <UiAvatarFallback>
              <UserRoundIcon />
            </UiAvatarFallback>
          </UiAvatar>
        </UiDropdownMenuTrigger>
      </UserDropDownMenu>
    </nav>
  </header>
</template>
<script setup lang="ts">
import { MenuIcon, UserRoundIcon } from 'lucide-vue-next';

defineEmits<{ menu: [] }>();

const userStore = useUserStore();
</script>
