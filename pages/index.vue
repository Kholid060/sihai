<template>
  <div>
    <p>Hello world</p>
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
