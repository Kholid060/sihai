<template>
  <UiTooltipProvider>
    <DashboardSidebar />
    <main class="py-9 pl-64">
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
