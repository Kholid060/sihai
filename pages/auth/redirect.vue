<template>
  <p class="px-4 py-12 text-center">Redirecting...</p>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: ['no-auth'],
});

const user = useSupabaseUser();

watch(
  user,
  () => {
    if (user.value) return navigateTo('/dashboard', { replace: true });
  },
  { immediate: true },
);
</script>
