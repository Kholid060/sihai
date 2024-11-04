<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <UiToaster />
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
const supabase = useSupabaseClient();

onBeforeMount(() => {
  supabase.auth.onAuthStateChange(console.log);
});
</script>
