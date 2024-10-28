<template>
  <div class="text-center">
    <img src="~/assets/svg/bug-fixing.svg" class="mx-auto w-64" />
    <h2 class="text-xl font-bold">{{ title }}</h2>
    <p class="mt-2 max-w-lg text-muted-foreground">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>
