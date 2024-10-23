<template>
  <multiselect
    v-if="model.operator === 'iao'"
    v-model="rightValue"
    :options="autocomplete"
    mode="tags"
    label="label"
    track-by="value"
    searchable
    placeholder="Select value"
    :close-on-select="false"
    :clear-on-select="false"
    class="ui condition-section"
  >
  </multiselect>
  <select
    v-else
    v-model="rightValue"
    class="h-10 w-full rounded-b-md bg-transparent px-2 text-sm"
  >
    <option value="" selected disabled>Select value</option>
    <option
      v-for="item in autocomplete"
      :key="item.value"
      :value="item.value.toString()"
    >
      {{ item.label }}
    </option>
  </select>
</template>
<script setup lang="ts">
import type { LinkRuleConditionValidation } from '~/server/validation/link.validation';
import Multiselect from '@vueform/multiselect';

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
const autocomplete = computed(() => {
  const items = linkRuleItems[model.value.left].possibleValues;
  if (!items) return [];

  return items.map((item) =>
    typeof item === 'string' ? { label: item, value: item } : item,
  );
});
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
