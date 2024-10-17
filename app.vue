<template>
  <NuxtLayout>
    <UiToaster />
    <NuxtPage />
  </NuxtLayout>
  <button @click="supabase.auth.signOut()">logout</button>
</template>
<script setup lang="ts">
const supabase = useSupabaseClient();

onBeforeMount(() => {
  supabase.auth.onAuthStateChange(console.log);
});
</script>
