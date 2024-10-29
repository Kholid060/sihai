<template>
  <div
    class="loading-indicator fixed top-0 z-[999] h-1 w-full bg-primary/50"
    :style="{
      height: isFetching ? 4 : 0,
      transition: 'height 150ms ease',
      '--play': isFetching ? 'running' : 'unset',
    }"
  >
    <span class="progress-1 absolute inset-y-0 left-0 h-full bg-primary/90" />
    <span class="progress-2 absolute inset-y-0 left-0 h-full bg-primary/90" />
  </div>
</template>
<script setup lang="ts">
import { useIsFetching } from '@tanstack/vue-query';

const isFetching = useIsFetching();

watch(isFetching, console.log);
</script>
<style lang="postcss" scoped>
.loading-indicator {
  .progress-1 {
    width: auto;
    transform-origin: left center;
    transition: transform 0.2s linear 0s;
    animation: 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) 0s infinite normal
      none var(--play) animation-progress-1;
  }
  .progress-2 {
    width: auto;
    transform-origin: left center;
    transition: transform 0.2s linear 0s;
    animation: 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite normal
      none var(--play) animation-progress-2;
  }
}
</style>
