<template>
  <ul>
    <li v-for="(conditions, index) in model.conditions" :key="index">
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
              <UiSelectContent>
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
            <div
              :class="
                clsx(
                  'flex items-center border-x pr-2',
                  linkRuleItems[condition.left].type === 'boolean' &&
                    'rounded-b-lg border-b',
                )
              "
            >
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
            <div
              v-if="linkRuleItems[condition.left].type !== 'boolean'"
              class="min-h-10 rounded-md rounded-t-none border"
            >
              <component
                :is="RIGHT_COMPONENT_MAP[linkRuleItems[condition.left].type]"
                :model-value="condition"
                @update:model-value="condition.right = $event.right"
              />
            </div>
          </li>
        </ul>
      </div>
      <div v-if="index !== model.conditions.length - 1" class="mt-2 w-full">
        <UiButton
          size="sm"
          variant="secondary"
          @click="addRuleCondition('and', index)"
        >
          <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
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
        v-if="model.conditions.length === 0"
        variant="secondary"
        @click="addRuleCondition('or')"
      >
        <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
        Add condition
      </UiButton>
      <template v-else>
        <UiButton
          size="sm"
          variant="secondary"
          @click="addRuleCondition('and', model.conditions.length - 1)"
        >
          <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
          AND
        </UiButton>
        <UiButton
          variant="secondary"
          size="sm"
          class="ml-2"
          @click="addRuleCondition('or')"
        >
          <PlusIcon class="-ml-1 mr-1 size-5 text-muted-foreground" />
          OR
        </UiButton>
      </template>
    </li>
  </ul>
</template>
<script setup lang="ts">
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { PlusIcon, TrashIcon, InfoIcon } from 'lucide-vue-next';
import type {
  LinkRuleConditionBase,
  LinkRuleConditionDataType,
} from '~/interface/link-rule.interface';
import type { LinkRuleConditionType } from '~/server/const/link.const';
import { LINK_RULE_CONDITION_OPERATOR } from '~/server/const/link.const';
import type { LinkRuleValidation } from '~/server/validation/link.validation';

const model = defineModel<LinkRuleValidation>({ default: {} });

const RIGHT_COMPONENT_MAP: Record<LinkRuleConditionDataType, Component | null> =
  {
    boolean: null,
    date: defineAsyncComponent(
      () => import('./LinkRuleConditionRightDate.vue'),
    ),
    time: defineAsyncComponent(
      () => import('./LinkRuleConditionRightTime.vue'),
    ),
    list: defineAsyncComponent(
      () => import('./LinkRuleConditionRightList.vue'),
    ),
    number: defineAsyncComponent(
      () => import('./LinkRuleConditionRightNumber.vue'),
    ),
    string: defineAsyncComponent(
      () => import('./LinkRuleConditionRightString.vue'),
    ),
  };

const groupedLinkRuleItems = Object.values(linkRuleItems).reduce<
  Record<string, LinkRuleConditionBase<LinkRuleConditionType>[]>
>((acc, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);

  return acc;
}, {});

function addRuleCondition(type: 'or' | 'and', index?: number) {
  if (!model.value) return;

  if (type === 'or') {
    model.value.conditions.push([
      { id: nanoid(4), left: 'country', operator: 'e', right: '' },
    ]);
    return;
  } else if (typeof index === 'number') {
    model.value.conditions[index].push({
      id: nanoid(4),
      left: 'country',
      operator: 'e',
      right: '',
    });
  }
}
function onConditionLeftChanged(
  type: LinkRuleConditionType,
  conditionIndex: number,
  innerIndex: number,
) {
  if (!model.value) return;

  const condition = model.value.conditions[conditionIndex][innerIndex];
  condition.left = type;

  if (linkRuleItems[condition.left].type === 'list') {
    condition.right = [];
  }

  // damn, ok
  const possibleOperators =
    linkRuleConditionOperatorsByType[linkRuleItems[type].type];
  if (!possibleOperators.includes(condition.operator)) {
    condition.operator = possibleOperators[0];
  }
}
function deleteCondition(conditionIndex: number, innerIndex: number) {
  if (!model.value) return;

  model.value.conditions[conditionIndex].splice(innerIndex, 1);
  if (model.value.conditions[conditionIndex].length === 0) {
    model.value.conditions.splice(conditionIndex, 1);
  }
}
</script>
