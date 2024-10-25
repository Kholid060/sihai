<template>
  <ul class="space-y-3">
    <li
      v-for="(rule, index) in model"
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
      <UiButton
        variant="ghost"
        size="icon-sm"
        class="text-destructive hover:text-destructive"
        @click.stop="model.splice(index, 1)"
      >
        <TrashIcon class="size-5" />
      </UiButton>
    </li>
  </ul>
  <UiButton variant="secondary" class="mt-6" @click="addRule">
    <PlusIcon class="-ml-1 mr-1 size-5" />
    Add rule
  </UiButton>
  <UiDialog :open="Boolean(editRule)" @update:open="removeEditRule">
    <UiDialogScrollContent v-if="editRule" class="max-w-xl">
      <UiDialogTitle>
        <div class="relative font-serif text-lg font-bold">
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
        <UiInput
          v-model="editRule.target"
          type="url"
          placeholder="https://example.com"
        />
        <p v-if="isInvalidTarget" class="text-sm text-destructive">
          Invalid URL
        </p>
      </fieldset>
      <div>
        <h4 class="font-bold">Conditions</h4>
        <LinkRuleConditions v-model="editRule" />
        <UiDialogFooter class="mt-8">
          <UiButton variant="outline" @click="removeEditRule">Cancel</UiButton>
          <UiButton class="min-w-20" @click="saveChanges">
            Save changes
          </UiButton>
        </UiDialogFooter>
      </div>
    </UiDialogScrollContent>
  </UiDialog>
</template>
<script setup lang="ts">
import {
  PlusIcon,
  SignpostIcon,
  CornerDownRightIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-vue-next';
import { nanoid } from 'nanoid/non-secure';
import { z } from 'zod';
import type { LinkRuleValidation } from '~/server/validation/link.validation';

const model = defineModel<LinkRuleValidation[]>({ default: [] });

const editRule = ref<null | LinkRuleValidation>(null);
const isInvalidTarget = shallowRef(false);

function addRule() {
  model.value.push({
    target: '',
    id: nanoid(4),
    conditions: [],
    name: 'Unnamed rule',
  });
}
function setEditRule(rule: LinkRuleValidation) {
  editRule.value = structuredClone(toRaw(rule));
}
function removeEditRule() {
  editRule.value = null;
  isInvalidTarget.value = false;
}
function saveChanges() {
  if (!editRule.value) return;

  if (z.string().url().safeParse(editRule.value.target).error) {
    console.log('huh');
    isInvalidTarget.value = true;
    return;
  }

  isInvalidTarget.value = false;

  const index = model.value.findIndex((item) => item.id === editRule.value!.id);
  if (index === -1) return;

  model.value[index] = editRule.value;
  editRule.value = null;
}
</script>
