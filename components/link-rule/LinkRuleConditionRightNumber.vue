<template>
  <UiTagsInput
    v-if="model.operator === 'iao'"
    v-model="rightValue as string[]"
    class="rounded-t-none border-0"
  >
    <UiTagsInputItem v-for="item in rightValue" :key="item" :value="item">
      <UiTagsInputItemText />
      <UiTagsInputItemDelete />
    </UiTagsInputItem>
    <UiTagsInputInput
      type="number"
      placeholder="Value (press enter to add item)"
    />
  </UiTagsInput>
  <input
    v-else
    v-model="rightValue"
    type="number"
    placeholder="Value"
    class="size-full min-h-10 rounded-md rounded-t-none bg-transparent px-3 text-sm"
  />
</template>
<script setup lang="ts">
import type { LinkRuleConditionValidation } from '~/server/validation/link.validation';

const model = defineModel<LinkRuleConditionValidation>({ default: {} });

const rightValue = computed({
  get() {
    if (model.value.operator === 'iao') {
      return Array.isArray(model.value.right) ? model.value.right : [];
    }

    return Array.isArray(model.value.right) ? '' : model.value.right;
  },
  set(value) {
    model.value.right = value;
  },
});
</script>
