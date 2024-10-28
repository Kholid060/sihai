<template>
  <UiTooltipProvider>
    <DashboardSidebar class="hidden lg:flex" />
    <main class="py-9 lg:pl-64">
      <div class="container">
        <NuxtPage />
      </div>
    </main>
  </UiTooltipProvider>
</template>
<script setup lang="ts">
const userStore = useUserStore();

await callOnce(userStore.fetch);
</script>
