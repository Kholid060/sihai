<template>
  <UiTabs default-value="detail">
    <div
      class="w-screen max-w-xl overflow-auto px-2 pb-2"
      style="max-height: calc(100vh - 6rem); transition: height 250ms ease"
    >
      <div
        ref="contentContainerRef"
        class="w-full rounded-lg bg-card p-4 shadow-sm"
      >
        <form class="w-full" @submit="onSubmit">
          <UiTabsContent tabindex="-1" class="mt-0 w-full" value="detail">
            <div class="space-y-3">
              <UiFormField v-slot="{ componentField }" name="target">
                <UiFormItem>
                  <UiFormLabel>Destination URL</UiFormLabel>
                  <UiInput
                    v-bind="componentField"
                    type="url"
                    class="bg-card"
                    placeholder="https://example.com/sub/my/long-url"
                  />
                  <UiFormMessage />
                  <UiFormDescription />
                </UiFormItem>
              </UiFormField>
              <UiFormField v-slot="{ componentField }" name="title">
                <UiFormItem>
                  <UiFormLabel>Title (optional)</UiFormLabel>
                  <UiInput
                    placeholder="A short link"
                    v-bind="componentField"
                    class="bg-card"
                  />
                  <UiFormMessage />
                  <UiFormDescription />
                </UiFormItem>
              </UiFormField>
              <UiFormField v-slot="{ componentField }" name="key">
                <UiFormItem>
                  <UiFormLabel>Short Link (optional)</UiFormLabel>
                  <div class="flex">
                    <p
                      class="inline-flex items-center rounded-l-md border bg-background px-2 text-sm"
                    >
                      example.com/
                    </p>
                    <UiInput
                      v-bind="componentField"
                      placeholder="optional"
                      class="grow rounded-l-none border-l-0 bg-card"
                    />
                  </div>
                  <UiFormMessage />
                  <UiFormDescription />
                </UiFormItem>
              </UiFormField>
            </div>
          </UiTabsContent>
          <UiTabsContent tabindex="-1" class="mt-0" value="rules">
            <UiFormField v-slot="{ value, errorMessage }" name="rules">
              <ClientOnly>
                <LinkRule
                  :model-value="value"
                  @update:model-value="setFieldValue('rules', $event)"
                />
              </ClientOnly>
              <UiAlert v-if="errorMessage" variant="destructive" class="mt-4">
                <UiAlertTitle>Error on one of the rules</UiAlertTitle>
                <UiAlertDescription>{{ errorMessage }}</UiAlertDescription>
              </UiAlert>
            </UiFormField>
          </UiTabsContent>
          <UiTabsContent tabindex="-1" class="mt-0" value="utm">
            <UiAlert
              v-if="!linkTarget.valid"
              class="mb-4 mt-2 items-center"
              variant="destructive"
            >
              <UiAlertTitle> Enter a valid destination URL first </UiAlertTitle>
            </UiAlert>
            <div class="space-y-3">
              <template v-for="item in utmForms" :key="item.key">
                <UiFormField
                  v-slot="{ componentField }"
                  :name="`utmOptions.${item.key}`"
                >
                  <UiFormItem>
                    <UiFormLabel>
                      {{ item.label }} (<code>{{
                        LINK_UTM_QUERY_MAP[item.key]
                      }}</code
                      >)
                    </UiFormLabel>
                    <UiInput
                      v-bind="componentField"
                      class="bg-card"
                      :placeholder="item.placeholder"
                      :disabled="!linkTarget.valid"
                      @update:model-value="
                        onUTMChanged(item.key, $event.toString())
                      "
                    />
                    <UiFormMessage />
                    <UiFormDescription />
                  </UiFormItem>
                </UiFormField>
              </template>
            </div>
            <div
              v-if="linkTarget.utmUrl.trim()"
              class="mt-4 w-full overflow-hidden"
            >
              <UiLabel>URL Preview</UiLabel>
              <pre
                class="mt-1 w-full whitespace-pre-wrap break-words rounded-md border bg-background p-2 text-sm text-muted-foreground"
                v-text="linkTarget.utmUrl"
              />
            </div>
          </UiTabsContent>
          <div class="mt-10 flex items-center">
            <UiTabsList>
              <UiTabsTrigger value="detail">
                <FileTextIcon class="inline size-4 align-sub" />
                Detail
              </UiTabsTrigger>
              <UiTabsTrigger value="rules">
                <WorkflowIcon class="inline size-4 align-sub" />
                Rules
              </UiTabsTrigger>
              <UiTabsTrigger value="utm">
                <MilestoneIcon class="inline size-4 align-sub" />
                UTM
              </UiTabsTrigger>
            </UiTabsList>
            <div class="grow"></div>
            <UiButton type="submit" :is-loading="isLoading">
              Create link
            </UiButton>
          </div>
        </form>
      </div>
    </div>
  </UiTabs>
</template>
<script lang="ts" setup>
import { FetchError } from 'ofetch';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { FileTextIcon, MilestoneIcon, WorkflowIcon } from 'lucide-vue-next';
import {
  newLinkValidation,
  type LinkUTMOptionsValidation,
} from '~/server/validation/link.validation';
import { LINK_UTM_QUERY_MAP } from '~/server/const/link.const';
import { nanoid } from 'nanoid';
import { useResizeObserver, watchDebounced } from '@vueuse/core';
import { useToast } from '../ui/toast';
import type { LinkDetail } from '~/interface/link.interface';

const emit = defineEmits<{
  'new-link': [link: LinkDetail];
}>();

const utmForms: {
  label: string;
  placeholder: string;
  key: keyof LinkUTMOptionsValidation;
}[] = [
  { key: 'source', label: 'Source', placeholder: 'google' },
  { key: 'medium', label: 'Medium', placeholder: 'social' },
  { key: 'campaign', label: 'Campaign', placeholder: 'black_friday_sale' },
  { key: 'term', label: 'Term', placeholder: 'hoodie' },
  { key: 'content', label: 'Content', placeholder: 'header_image' },
  { key: 'ref', label: 'Referral', placeholder: 'example.com' },
];

let targetObjUrl: URL | null = null;

const toast = useToast();
const { handleSubmit, values, isFieldValid, setFieldValue, setFieldError } =
  useForm({
    validationSchema: toTypedSchema(newLinkValidation),
    initialValues: {
      utmOptions: {},
      key: nanoid(6),
    },
    keepValuesOnUnmount: true,
  });

const isLoading = shallowRef(false);
const contentContainerRef = ref<HTMLElement>();

const linkTarget = shallowReactive<{ valid: boolean; utmUrl: string }>({
  utmUrl: '',
  valid: false,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true;
    const result = await $fetch('/api/links', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    emit('new-link', result.data);
  } catch (error) {
    if (
      error instanceof FetchError &&
      error.data.data?.code === 'duplicate-key'
    ) {
      setFieldError('key', 'This short link already exists');
      return;
    }

    toast.toast({
      ...getFetchError(error),
      variant: 'destructive',
    });
  } finally {
    isLoading.value = false;
  }
});

function onUTMChanged(key: keyof LinkUTMOptionsValidation, value: string) {
  if (!linkTarget.valid || !targetObjUrl) return;

  if (!value.trim()) {
    targetObjUrl.searchParams.delete(LINK_UTM_QUERY_MAP[key]);
  } else {
    targetObjUrl.searchParams.set(LINK_UTM_QUERY_MAP[key], value);
  }
  linkTarget.utmUrl = targetObjUrl.href;
}

useResizeObserver(contentContainerRef, ([entry]) => {
  (entry.target.parentElement as HTMLElement).style.height =
    entry.contentRect.height + 45 + 'px';
});

watchDebounced(
  () => values.target,
  (value) => {
    const isValid = isFieldValid('target');
    Object.assign(linkTarget, {
      valid: isValid,
      url: value && isValid ? value : '',
    });

    if (targetObjUrl) return;

    if (!isValid) {
      targetObjUrl = null;
      linkTarget.utmUrl = '';
    } else if (isValid && value) {
      targetObjUrl = new URL(value);
      for (const _key in values.utmOptions ?? {}) {
        const key = _key as keyof LinkUTMOptionsValidation;
        if (!values.utmOptions?.[key]?.trim()) continue;

        targetObjUrl.searchParams.set(
          LINK_UTM_QUERY_MAP[key],
          values.utmOptions[key],
        );
      }

      linkTarget.utmUrl = targetObjUrl.href;
    }
  },
  { debounce: 250 },
);
</script>
