<template>
  <DashboardSidebar />
  <main class="pl-64">
    <div class="container">
      <NuxtPage />
    </div>
  </main>
</template>
<script setup lang="ts">
const userStore = useUserStore();

await callOnce(userStore.fetch);
</script>
