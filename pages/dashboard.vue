<template>
  <DashboardSidebar
    class="lg:flex"
    :class="showSidebar ? 'fixed z-[9999]' : 'hidden'"
  />
  <div
    v-if="showSidebar"
    class="fixed z-[9998] size-full bg-black/10 backdrop-blur-sm lg:hidden"
    @click="showSidebar = false"
  ></div>
  <DashboardNavigation @menu="showSidebar = !showSidebar" />
  <main class="py-9 lg:pl-64">
    <div class="container">
      <NuxtPage />
    </div>
  </main>
</template>
<script setup lang="ts">
import { APP_NAME } from '~/server/const/app.const';

useSeoMeta({
  title: APP_NAME,
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - ${APP_NAME} Dashboard`
      : `${APP_NAME} Dashboard`;
  },
});

const userStore = useUserStore();

const showSidebar = shallowRef(false);

await callOnce(userStore.fetch);
</script>
