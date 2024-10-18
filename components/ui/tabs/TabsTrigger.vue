<script setup lang="ts">
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';
import { uiTabTriggerVariants } from '.';
import { useTabVariant } from './useTabVariant';

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes['class'] }
>();

const tabVariant = useTabVariant();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="uiTabTriggerVariants({ class: props.class, variant: tabVariant })"
  >
    <span class="truncate">
      <slot />
    </span>
  </TabsTrigger>
</template>
