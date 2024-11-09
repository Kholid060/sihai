<template>
  <p class="px-4 py-12 text-center">Redirecting...</p>
</template>
<script lang="ts" setup>
useSeoMeta({
  title: 'Redirect...',
});

const route = useRoute();
const user = useSupabaseUser();

watch(
  user,
  () => {
    if (user.value) {
      return navigateTo(
        typeof route.query?.path === 'string'
          ? decodeURIComponent(route.query.path)
          : '/dashboard',
        { replace: true },
      );
    }
  },
  { immediate: true },
);
</script>
