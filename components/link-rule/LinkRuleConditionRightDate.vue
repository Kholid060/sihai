<template>
  <UiPopover>
    <UiPopoverTrigger v-if="!Array.isArray(rightValue)" as-child>
      <button
        variant="outline"
        :class="
          cn(
            'flex h-10 w-full items-center px-3 text-left text-sm font-normal',
            !rightValue && 'text-muted-foreground',
          )
        "
      >
        {{
          rightValue
            ? df.format(rightValue.toDate(getLocalTimeZone()))
            : 'Pick a date'
        }}
      </button>
    </UiPopoverTrigger>
    <UiPopoverTrigger v-else as-child>
      <button
        class="flex min-h-10 w-full flex-wrap items-center gap-1 px-3 py-2 text-sm"
      >
        <span
          v-for="date in rightValue"
          :key="date.toString()"
          as="span"
          class="inline-flex h-7 items-center rounded-sm border bg-secondary px-2"
        >
          {{ df.format(date.toDate(getLocalTimeZone())) }}
        </span>
        <p class="text-muted-foreground">Select date</p>
      </button>
    </UiPopoverTrigger>
    <UiPopoverContent class="w-auto p-0">
      <div v-if="Array.isArray(rightValue)">
        <UiCalendar v-model="rightValue" multiple />
        <div class="px-4 pb-4 text-right">
          <button
            class="text-sm text-muted-foreground underline"
            @click="model.right = []"
          >
            Clear all
          </button>
        </div>
      </div>
      <UiCalendar v-else v-model="rightValue" />
    </UiPopoverContent>
  </UiPopover>
</template>
<script setup lang="ts">
import type { LinkRuleConditionValidation } from '~/server/validation/link.validation';
import {
  DateFormatter,
  type DateValue,
  parseDate,
  getLocalTimeZone,
  today,
} from '@internationalized/date';
import { cn } from '~/lib/utils';

const model = defineModel<LinkRuleConditionValidation>({ default: {} });

const df = new DateFormatter(navigator.language, {
  dateStyle: 'long',
});

function tryParseDate(str: string) {
  try {
    return parseDate(str);
  } catch {
    return null;
  }
}

const rightValue = computed<DateValue | DateValue[]>({
  get() {
    let value: string | string[] = model.value.right;

    if (model.value.operator === 'iao') {
      value = Array.isArray(model.value.right) ? model.value.right : [];
    } else {
      value = Array.isArray(model.value.right) ? '' : model.value.right;
    }

    return Array.isArray(value)
      ? value.reduce<DateValue[]>((acc, curr) => {
          const date = tryParseDate(curr);
          if (date) acc.push(date);

          return acc;
        }, [])
      : (tryParseDate(value) ?? today(getLocalTimeZone()));
  },
  set(value) {
    model.value.right = Array.isArray(value)
      ? value.map((date) => date.toString())
      : value.toString();
  },
});
</script>
