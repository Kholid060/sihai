<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { LoaderCircleIcon } from 'lucide-vue-next';
import { type ButtonVariants, buttonVariants } from '.';
import { cn } from '@/lib/utils';

interface Props extends PrimitiveProps {
  isLoading?: boolean;
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  variant?: ButtonVariants['variant'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :disabled="isLoading || $attrs.disabled"
    :class="cn(buttonVariants({ variant, size }), props.class, isLoading && 'relative')"
  >
    <slot />
    <div
      v-if="isLoading"
      style="background-color: inherit; border-radius: inherit"
      class="absolute top-0 left-0 z-50 w-full h-full flex items-center justify-center"
    >
      <LoaderCircleIcon
        style="color: inherit"
        class="animate-spin"
      />
    </div>
  </Primitive>
</template>
