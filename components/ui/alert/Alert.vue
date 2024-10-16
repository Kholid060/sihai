<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { type AlertVariants, alertVariants } from '.'
import { AlertTriangleIcon, InfoIcon, CheckIcon } from 'lucide-vue-next';

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: AlertVariants['variant']
}>()

const iconComponent = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return { icon: AlertTriangleIcon, class: 'text-destructive' };
    case 'success':
      return { icon: CheckIcon, class: 'text-blue-600' };
    case 'default':
    default:
      return { icon: InfoIcon, class: 'text-lime-11' };
  }
});
</script>

<template>
  <div :class="cn(alertVariants({ variant }), props.class)" role="alert">
    <div class="rounded-full shadow-inner bg-white border-2 border-white p-2 inline-block">
      <slot name="icon">
        <component :is="iconComponent.icon" :class="'size-5 ' + iconComponent.class" />
      </slot>
    </div>
    <div class="mt-0.5">
      <slot />
    </div>
  </div>
</template>
