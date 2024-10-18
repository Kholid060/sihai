<template>
  <header class="bg-grass-12 text-olive-1">
    <div class="container">
      <nav class="flex h-14 items-center">
        <p>App name</p>
        <div class="grow"></div>
        <UiDropdownMenu v-if="user">
          <UiDropdownMenuTrigger>
            <UiAvatar class="size-8 bg-background align-middle">
              <UiAvatarImage :src="user?.user_metadata.avatar_url" />
              <UiAvatarFallback>
                <UserRoundIcon />
              </UiAvatarFallback>
            </UiAvatar>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" class="w-48">
            <div class="p-2">
              <p>{{ user.user_metadata.full_name }}</p>
              <p>{{ user.user_metadata.email }}</p>
            </div>
            <UiDropdownMenuItem>halo</UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </nav>
    </div>
  </header>
  <slot />
</template>
<script setup lang="ts">
import { UserRoundIcon } from 'lucide-vue-next';

const user = useSupabaseUser();
</script>
