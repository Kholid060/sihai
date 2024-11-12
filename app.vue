<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <UiToaster />
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import { APP_NAME } from './server/const/app.const';

useServerSeoMeta({
  title: APP_NAME,
  ogTitle: APP_NAME,
});
useSeoMeta({
  titleTemplate: (titleChunk) => {
    return titleChunk && titleChunk !== APP_NAME
      ? `${titleChunk} - ${APP_NAME}`
      : APP_NAME;
  },
});
</script>
