<template>
  <UiTooltip v-bind="forwarded">
    <UiTooltipTrigger as-child>
      <slot />
    </UiTooltipTrigger>
    <UiTooltipContent>
      {{ label }}
    </UiTooltipContent>
  </UiTooltip>
</template>
<script setup lang="ts">
import {
  type TooltipRootEmits,
  type TooltipRootProps,
  useForwardPropsEmits,
} from 'radix-vue';

const emits = defineEmits<TooltipRootEmits>();
const props = defineProps<TooltipRootProps & { label: string }>();

const forwarded = useForwardPropsEmits(props, emits);
</script>
