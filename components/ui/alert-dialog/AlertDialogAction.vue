<script setup lang="ts">
import { buttonVariants, type ButtonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertDialogAction, type AlertDialogActionProps } from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';

const props = defineProps<
  AlertDialogActionProps & {
    class?: HTMLAttributes['class'];
    variant?: ButtonVariants['variant'];
  }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <AlertDialogAction
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant }), props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>
