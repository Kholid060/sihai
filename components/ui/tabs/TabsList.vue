<script setup lang="ts">
import { TabsList, type TabsListProps } from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';
import { useTabVariant } from './useTabVariant';
import { uiTabListVariants } from '.';

const props = defineProps<
  TabsListProps & { class?: HTMLAttributes['class'] }
>();

const tabVariant = useTabVariant();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <TabsList
    v-bind="delegatedProps"
    :class="uiTabListVariants({ class: props.class, variant: tabVariant })"
  >
    <slot />
  </TabsList>
</template>
