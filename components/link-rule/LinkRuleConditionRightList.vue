<template>
  <multiselect
    v-if="model.operator === 'iao'"
    v-model="rightValue"
    :options="autocomplete"
    mode="tags"
    label="label"
    track-by="value"
    searchable
    :strict="false"
    :search-filter="searchFilter"
    placeholder="Select value"
    :close-on-select="false"
    :clear-on-select="false"
    class="ui condition-section"
  />
  <multiselect
    v-else
    v-model="rightValue"
    :options="autocomplete"
    :strict="false"
    :search-filter="searchFilter"
    mode="single"
    label="label"
    track-by="value"
    searchable
    placeholder="Select value"
    class="ui condition-section"
  />
</template>
<script setup lang="ts">
import type { LinkRuleConditionValidation } from '~/server/validation/link.validation';
import Multiselect from '@vueform/multiselect';
import type { LinkRuleConditionOptionItem } from '~/interface/link-rule.interface';

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
const autocomplete = computed(
  () => linkRuleItems[model.value.left].possibleValues ?? [],
);

const searchFilter = (option: LinkRuleConditionOptionItem, query: string) => {
  return option.label.toLowerCase().includes(query.toLowerCase());
};
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
