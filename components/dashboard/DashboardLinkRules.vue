<template>
  <ul class="space-y-2">
    <li
      v-for="rule in rules"
      :key="rule.id"
      class="flex cursor-pointer items-center rounded-md border px-4 py-3 transition-colors hover:bg-secondary"
      @click="setEditRule(rule)"
    >
      <span class="rounded-full border border-border/50 bg-background p-2">
        <SignpostIcon class="size-5" />
      </span>
      <div class="ml-3 grow">
        <p class="truncate font-medium leading-tight">{{ rule.name }}</p>
        <p class="truncate text-sm text-muted-foreground">
          <CornerDownRightIcon class="inline size-4 align-top" />
          {{ rule.target || 'No destination' }}
        </p>
      </div>
    </li>
  </ul>
  <UiButton variant="secondary" class="mt-4" @click="addRule">
    <PlusIcon class="-ml-1 mr-1 size-5" />
    Add rule
  </UiButton>
  <UiDialog :open="Boolean(editRule)" @update:open="editRule = null">
    <UiDialogScrollContent v-if="editRule" class="max-w-xl">
      <UiDialogTitle>
        <div class="relative font-serif text-xl font-bold">
          <PencilIcon
            class="pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            v-model="editRule.name"
            placeholder="Rule name"
            tabindex="-1"
            class="w-full bg-background pl-6 focus:outline-none"
          />
        </div>
      </UiDialogTitle>
      <fieldset>
        <UiLabel>Destination URL</UiLabel>
        <UiInput type="url" placeholder="https://example.com" />
      </fieldset>
      <div>
        <h4 class="text-lg font-bold">Rules</h4>
        <ul>
          <li v-for="(conditions, index) in editRule.conditions" :key="index">
            <div class="flex">
              <div v-if="conditions.length > 1" class="relative w-8">
                <div
                  class="absolute left-0 top-0 -z-10 h-full w-10 rounded-l-md border border-r-0 border-primary"
                ></div>
                <span
                  class="absolute -left-1/2 top-1/2 -translate-y-1/2 rounded-sm bg-primary px-1 py-0.5 text-sm"
                >
                  AND
                </span>
              </div>
              <ul class="grow space-y-2">
                <li
                  v-for="(condition, innerIndex) in conditions"
                  :key="condition.id"
                  class="group"
                >
                  <UiSelect
                    :model-value="condition.left"
                    @update:model-value="
                      onConditionLeftChanged(
                        $event as LinkRuleConditionType,
                        index,
                        innerIndex,
                      )
                    "
                  >
                    <UiSelectTrigger class="rounded-b-none">
                      <UiSelectValue />
                    </UiSelectTrigger>
                    <UiSelectContent position="item-aligned">
                      <UiSelectGroup
                        v-for="(items, group) in groupedLinkRuleItems"
                        :key="group"
                      >
                        <UiSelectLabel>{{ group }}</UiSelectLabel>
                        <UiSelectItem
                          v-for="item in items"
                          :key="item.id"
                          :value="item.id"
                        >
                          {{ item.label }}
                        </UiSelectItem>
                      </UiSelectGroup>
                    </UiSelectContent>
                  </UiSelect>
                  <div class="flex items-center border-x pr-2">
                    <UiSelect v-model="condition.operator">
                      <UiSelectTrigger
                        class="w-auto min-w-32 rounded-none border-0 border-r bg-transparent"
                      >
                        <UiSelectValue />
                      </UiSelectTrigger>
                      <UiSelectContent>
                        <UiSelectItem
                          v-for="operator in linkRuleConditionOperatorsByType[
                            linkRuleItems[condition.left].type
                          ]"
                          :key="operator"
                          :value="operator"
                        >
                          {{ LINK_RULE_CONDITION_OPERATOR[operator] }}
                        </UiSelectItem>
                      </UiSelectContent>
                    </UiSelect>
                    <UiLabel class="ml-4 inline-flex items-center gap-2">
                      <UiSwitch v-model="condition.isNot" />
                      NOT operator
                    </UiLabel>
                    <UiTooltip>
                      <UiTooltipTrigger as-child class="ml-1 cursor-default">
                        <InfoIcon
                          class="size-4 text-muted-foreground lg:invisible lg:group-hover:visible"
                        />
                      </UiTooltipTrigger>
                      <UiTooltipContent>
                        Convert the operator into NOT operator. <br />
                        E.g. the "equal" operator will become "not equal"
                      </UiTooltipContent>
                    </UiTooltip>
                    <div class="grow"></div>
                    <UiButton
                      size="icon-sm"
                      variant="ghost"
                      class="text-destructive hover:text-destructive"
                      @click="deleteCondition(index, innerIndex)"
                    >
                      <TrashIcon class="size-4" />
                    </UiButton>
                  </div>
                  <div class="min-h-10 rounded-md rounded-t-none border">
                    <UiInput class="rounded-t-none border-0" />
                  </div>
                </li>
              </ul>
            </div>
            <div
              v-if="index !== editRule.conditions.length - 1"
              class="mt-2 w-full"
            >
              <UiButton
                size="sm"
                variant="secondary"
                @click="addRuleCondition('and', index)"
              >
                <PlusIcon classs="-ml-1 mr-1 h-5 w-5" />
                <span>AND</span>
              </UiButton>
              <div class="relative h-8 w-full">
                <span
                  class="absolute left-1/2 top-1/2 z-10 min-w-9 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-grass-8 px-1 py-0 text-center"
                >
                  OR
                </span>
                <span
                  class="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-grass-8"
                ></span>
              </div>
            </div>
          </li>
          <li class="mt-4">
            <UiButton
              v-if="editRule.conditions.length === 0"
              variant="secondary"
              @click="addRuleCondition('or')"
            >
              <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
              Add condition
            </UiButton>
            <template v-else>
              <UiButton
                variant="secondary"
                @click="addRuleCondition('and', editRule.conditions.length - 1)"
              >
                <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
                AND
              </UiButton>
              <UiButton
                variant="secondary"
                class="ml-2"
                @click="addRuleCondition('or')"
              >
                <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
                OR
              </UiButton>
            </template>
          </li>
        </ul>
      </div>
      <UiDialogFooter class="mt-8">
        <UiButton variant="outline" @click="editRule = null">Cancel</UiButton>
        <UiButton class="min-w-20" @click="saveChanges">Save changes</UiButton>
      </UiDialogFooter>
    </UiDialogScrollContent>
  </UiDialog>
</template>
<script setup lang="ts">
import {
  PlusIcon,
  InfoIcon,
  TrashIcon,
  SignpostIcon,
  CornerDownRightIcon,
  PencilIcon,
} from 'lucide-vue-next';
import { nanoid } from 'nanoid/non-secure';
import type { LinkRuleConditionBase } from '~/interface/link-rule.interface';
import {
  LINK_RULE_CONDITION_OPERATOR,
  type LinkRuleConditionType,
} from '~/server/const/link.const';
import type { LinkRuleValidation } from '~/server/validation/link.validation';

const groupedLinkRuleItems = Object.values(linkRuleItems).reduce<
  Record<string, LinkRuleConditionBase<LinkRuleConditionType>[]>
>((acc, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);

  return acc;
}, {});

const rules = ref<LinkRuleValidation[]>([
  {
    id: 'aa',
    conditions: [],
    target: 'https://google.com',
    name: 'Unnamed rule',
  },
]);
const editRule = ref<null | LinkRuleValidation>(null);

function addRule() {
  rules.value.push({
    target: '',
    id: nanoid(4),
    conditions: [],
    name: 'Unnamed rule',
  });
}
function setEditRule(rule: LinkRuleValidation) {
  editRule.value = structuredClone(toRaw(rule));
}
function addRuleCondition(type: 'or' | 'and', index?: number) {
  if (!editRule.value) return;

  console.log('huh', type, index);

  if (type === 'or') {
    editRule.value.conditions.push([
      { id: nanoid(4), left: 'country', operator: 'e', right: '' },
    ]);
    return;
  } else if (typeof index === 'number') {
    editRule.value.conditions[index].push({
      id: nanoid(4),
      left: 'country',
      operator: 'e',
      right: '',
    });
  }
}
function saveChanges() {
  if (!editRule.value) return;

  console.log(editRule);
}
function onConditionLeftChanged(
  type: LinkRuleConditionType,
  conditionIndex: number,
  innerIndex: number,
) {
  if (!editRule.value) return;

  const condition = editRule.value.conditions[conditionIndex][innerIndex];
  condition.left = type;

  // damn, ok
  const possibleOperators =
    linkRuleConditionOperatorsByType[linkRuleItems[type].type];
  if (!possibleOperators.includes(condition.operator)) {
    condition.operator = possibleOperators[0];
  }
}
function deleteCondition(conditionIndex: number, innerIndex: number) {
  if (!editRule.value) return;

  editRule.value.conditions[conditionIndex].splice(innerIndex, 1);
  if (editRule.value.conditions[conditionIndex].length === 0) {
    editRule.value.conditions.splice(conditionIndex, 1);
  }
}

onMounted(() => {
  console.log(linkRuleItems);
});
</script>
