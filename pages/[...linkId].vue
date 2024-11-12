<template>
  <Content />
</template>
<script setup lang="ts">
definePageMeta({
  name: 'redirect-link',
});

const route = useRoute();
const { data, error } = await useFetch('/api/links/redirect', {
  params: {
    linkId: (route.params.linkId as string[]).join('/'),
  },
});

if (error.value) {
  showError({
    statusCode: error.value.statusCode,
    message: error.value.statusMessage,
  });
} else if (data.value) {
  await navigateTo(data.value, { external: true });
}

const Content = () => h('template');
</script>
