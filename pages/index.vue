<template>
  <div class="container h-96">
    <div class="size-full rounded-b-xl bg-grass-12">
      <p>Hello world</p>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  name: 'landing-page',
});

const url = useRequestURL();
const user = useSupabaseUser();

if (url.hostname.startsWith('app.')) {
  await navigateTo(user ? '/dashboard' : '/auth/signin', { replace: true });
}
</script>
