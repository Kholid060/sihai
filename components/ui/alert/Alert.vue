<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { AlertTriangleIcon, InfoIcon, CheckIcon } from 'lucide-vue-next';
import { type AlertVariants, alertVariants } from '.';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
  variant?: AlertVariants['variant'];
}>();

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
    <div
      class="inline-block rounded-full border-2 border-white bg-white p-2 shadow-inner"
    >
      <slot name="icon">
        <component
          :is="iconComponent.icon"
          :class="'size-5 ' + iconComponent.class"
        />
      </slot>
    </div>
    <div class="mt-0.5">
      <slot />
    </div>
  </div>
</template>
