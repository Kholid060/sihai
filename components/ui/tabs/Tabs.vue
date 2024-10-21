<script setup lang="ts">
import type { TabsRootEmits, TabsRootProps } from 'radix-vue';
import { TabsRoot, useForwardPropsEmits } from 'radix-vue';
import { TABS_INJECTION_KEY } from './injectionKey';
import type { UiTabVariant } from '.';

interface Props extends TabsRootProps {
  variant?: UiTabVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});
const emits = defineEmits<TabsRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);

provide(TABS_INJECTION_KEY, props.variant);
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
