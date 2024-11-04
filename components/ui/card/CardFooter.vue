<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('flex items-center p-4 pt-0 md:p-6 md:pt-0', props.class)">
    <slot />
  </div>
</template>
