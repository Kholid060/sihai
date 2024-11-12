<template>
  <UiTabs v-model="activeTab">
    <div class="flex flex-col-reverse md:flex-row md:pb-0">
      <div class="w-full px-2 py-3 md:w-64 md:px-3 md:py-4">
        <VisuallyHidden>{{ title }}</VisuallyHidden>
        <h2 class="hidden text-xl font-bold md:block">{{ title }}</h2>
        <UiTabsList v-if="isDesktop" class="custom-tabs mt-4 space-y-2">
          <UiTabsTrigger v-for="(tab, key) in TABS" :key="key" :value="key">
            <component :is="tab.icon" class="mr-2 size-5" />
            {{ tab.title }}
          </UiTabsTrigger>
        </UiTabsList>
        <UiSeparator class="my-4 hidden md:block" />
        <div class="flex items-center">
          <p class="grow text-sm font-semibold">QR Code Preview</p>
          <UiTooltipSimple label="Copy QR code">
            <UiButton
              variant="ghost"
              size="icon-sm"
              class="size-7 rounded-sm text-muted-foreground"
              :disabled="!state.isQrValid"
              @click="copyLinkQR"
            >
              <CopyIcon class="size-4" />
            </UiButton>
          </UiTooltipSimple>
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton
                variant="ghost"
                size="icon-sm"
                class="ml-0.5 size-7 rounded-sm text-muted-foreground"
                :disabled="!state.isQrValid"
              >
                <DownloadIcon class="size-4" />
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent>
              <UiDropdownMenuItem @click="downloadLinkQR('png')">
                Download as PNG
              </UiDropdownMenuItem>
              <UiDropdownMenuItem @click="downloadLinkQR('jpeg')">
                Download as JPEG
              </UiDropdownMenuItem>
              <UiDropdownMenuItem @click="downloadLinkQR('svg')">
                Download as SVG
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </div>
        <div
          class="mt-1 flex min-h-32 items-center justify-center rounded-md bg-secondary p-2"
        >
          <div
            v-if="!state.isQrValid"
            class="text-center text-muted-foreground"
          >
            <QrCodeIcon class="inline" />
            <p class="mt-1 text-sm">Enter short link first</p>
          </div>
          <div
            v-show="state.isQrValid"
            ref="qrCodeElRef"
            class="qrcode-container"
          ></div>
        </div>
      </div>
      <form
        class="flex min-h-[400px] w-screen grow flex-col rounded-lg bg-card p-4 shadow-sm md:max-w-xl md:p-6"
        @submit="onSubmit"
      >
        <h3 v-if="isDesktop" class="mb-3 text-lg font-bold">
          {{ TABS[activeTab].title }}
        </h3>
        <h3 v-else class="mb-3 text-lg font-bold">
          {{ title }}
        </h3>
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="detail">
          <div class="space-y-4">
            <UiFormField v-slot="{ componentField }" name="target">
              <UiFormItem>
                <UiFormLabel>Destination URL</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    type="url"
                    class="bg-card"
                    placeholder="https://example.com/sub/my/long-url"
                  />
                </UiFormControl>
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
            <UiFormField v-slot="{ componentField }" name="title">
              <UiFormItem>
                <UiFormLabel>Title (optional)</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    placeholder="A short link"
                    v-bind="componentField"
                    class="bg-card"
                  />
                </UiFormControl>
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
            <UiFormField v-slot="{ componentField }" name="key">
              <UiFormItem>
                <div class="flex items-center justify-between">
                  <UiFormLabel>Short Link (optional)</UiFormLabel>
                  <button
                    v-if="state.lockKey && isEditing"
                    class="mr-1 text-muted-foreground"
                    type="button"
                    @click="unlockKey"
                  >
                    <LockIcon class="size-4" />
                  </button>
                </div>
                <div class="flex">
                  <p
                    class="inline-flex items-center rounded-l-md border bg-background px-2 text-sm"
                  >
                    {{ APP_DOMAIN }}/
                  </p>
                  <UiFormControl>
                    <UiInput
                      v-bind="componentField"
                      placeholder="optional"
                      :disabled="isEditing && state.lockKey"
                      class="grow rounded-l-none border-l-0 bg-card"
                    />
                  </UiFormControl>
                </div>
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
            <UiFormField v-slot="{ componentField }" name="description">
              <UiFormItem>
                <UiFormLabel>Description (optional)</UiFormLabel>
                <UiFormControl>
                  <UiTextarea
                    placeholder="Short description about the link"
                    v-bind="componentField"
                    class="bg-card"
                  />
                </UiFormControl>
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
          </div>
        </UiTabsContent>
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="rules">
          <UiFormField v-slot="{ value, errorMessage, meta }" name="rules">
            <ClientOnly>
              <LinkRule
                :model-value="value"
                @update:model-value="setFieldValue('rules', $event)"
              />
            </ClientOnly>
            <UiAlert
              v-if="errorMessage && meta.dirty"
              variant="destructive"
              class="mt-4"
            >
              <UiAlertTitle>Error on one of the rules</UiAlertTitle>
              <UiAlertDescription>{{ errorMessage }}</UiAlertDescription>
            </UiAlert>
          </UiFormField>
        </UiTabsContent>
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="qrcode">
          <UiFormField
            v-slot="{ componentField, field }"
            name="qrOptions.color"
          >
            <UiFormItem>
              <UiFormLabel>Color</UiFormLabel>
              <div class="flex">
                <input
                  v-bind="field"
                  class="size-10 rounded-l-md border border-r-0"
                  type="color"
                />
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="optional"
                    class="grow rounded-l-none bg-card"
                  />
                </UiFormControl>
              </div>
              <UiFormMessage />
              <UiFormDescription />
            </UiFormItem>
          </UiFormField>
          <UiFormField
            v-slot="{ componentField, field }"
            name="qrOptions.bgColor"
          >
            <UiFormItem class="mt-4">
              <UiFormLabel>Background Color</UiFormLabel>
              <div class="flex">
                <input
                  v-bind="field"
                  class="size-10 rounded-l-md border border-r-0"
                  type="color"
                />
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="optional"
                    class="grow rounded-l-none bg-card"
                  />
                </UiFormControl>
              </div>
              <UiFormMessage />
              <UiFormDescription />
            </UiFormItem>
          </UiFormField>
          <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <UiFormField
              v-slot="{ componentField }"
              name="qrOptions.cornerSquareType"
            >
              <UiFormItem class="mt-4">
                <UiFormLabel>Corner Square Type</UiFormLabel>
                <UiFormControl>
                  <UiSelect v-bind="componentField">
                    <UiSelectTrigger class="bg-inherit">
                      <UiSelectValue />
                    </UiSelectTrigger>
                    <UiSelectContent>
                      <UiSelectItem value="square"> Square </UiSelectItem>
                      <UiSelectItem value="extra-rounded">
                        Extra rounded
                      </UiSelectItem>
                      <UiSelectItem value="dot"> Dot </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </UiFormControl>
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
            <UiFormField
              v-slot="{ componentField }"
              name="qrOptions.cornerDotType"
            >
              <UiFormItem class="mt-4">
                <UiFormLabel>Corner Dot Type</UiFormLabel>
                <UiFormControl>
                  <UiSelect v-bind="componentField">
                    <UiSelectTrigger class="bg-inherit">
                      <UiSelectValue />
                    </UiSelectTrigger>
                    <UiSelectContent>
                      <UiSelectItem value="square"> Square </UiSelectItem>
                      <UiSelectItem value="dot"> Dot </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </UiFormControl>
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
          </div>
          <UiFormField v-slot="{ value, handleChange }" name="qrOptions.logo">
            <UiFormItem class="mt-7 flex items-center gap-2 space-y-0">
              <UiFormControl>
                <UiSwitch
                  :checked="value"
                  :disabled="userStore.profile.plan.name === APP_FREE_PLAN.id"
                  aria-readonly
                  @update:checked="handleChange"
                />
              </UiFormControl>
              <UiFormLabel>Show logo</UiFormLabel>
              <UiFormMessage />
              <UiFormDescription />
            </UiFormItem>
          </UiFormField>
        </UiTabsContent>
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="utm">
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
                  <UiFormControl>
                    <UiInput
                      v-bind="componentField"
                      class="bg-card"
                      :placeholder="item.placeholder"
                      :disabled="!linkTarget.valid"
                      @update:model-value="
                        onUTMChanged(item.key, $event.toString())
                      "
                    />
                  </UiFormControl>
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
        <div v-if="isDesktop" class="mt-10 flex items-center">
          <div class="grow"></div>
          <UiButton as-child variant="outline" class="bg-inherit">
            <UiDialogClose> Cancel </UiDialogClose>
          </UiButton>
          <UiButton type="submit" class="ml-4" :is-loading="state.isLoading">
            {{ submitLabel }}
          </UiButton>
        </div>
      </form>
    </div>
    <div v-if="!isDesktop" class="sticky bottom-0 bg-background p-2 sm:flex">
      <UiSelect v-model="activeTab">
        <UiSelectTrigger class="mb-2 sm:w-auto">
          <UiSelectValue />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem v-for="(tab, key) in TABS" :key="key" :value="key">
            {{ tab.title }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
      <div class="grow"></div>
      <div class="flex">
        <UiButton as-child variant="ghost">
          <UiDialogClose> Cancel </UiDialogClose>
        </UiButton>
        <UiButton type="submit" class="ml-4 grow" :is-loading="state.isLoading">
          {{ submitLabel }}
        </UiButton>
      </div>
    </div>
  </UiTabs>
</template>
<script lang="ts" setup>
import { FetchError } from 'ofetch';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import {
  FileTextIcon,
  MilestoneIcon,
  WorkflowIcon,
  DownloadIcon,
  QrCodeIcon,
  CopyIcon,
  LockIcon,
} from 'lucide-vue-next';
import {
  newLinkValidation,
  type LinkUTMOptionsValidation,
  type NewLinkValidation,
  type UpdateLinkValidation,
} from '~/server/validation/link.validation';
import { LINK_UTM_QUERY_MAP } from '~/server/const/link.const';
import { nanoid } from 'nanoid';
import { useMediaQuery, watchDebounced } from '@vueuse/core';
import { useToast } from '../ui/toast';
import type { LinkDetail } from '~/interface/link.interface';
import { VisuallyHidden } from 'radix-vue';
import UiTooltipSimple from '~/components/ui/tooltip/TooltipSimple.vue';
import QRCodeStyling, { type Options } from 'qr-code-styling';
import logoPng from '~/assets/images/logo.png';
import { APP_FREE_PLAN } from '~/server/const/app.const';

const props = withDefaults(
  defineProps<{
    title?: string;
    linkId?: string;
    isEditing?: boolean;
    submitLabel?: string;
    defaultValue?: NewLinkValidation;
  }>(),
  {
    title: 'Create new link',
    submitLabel: 'Create link',
  },
);
const emit = defineEmits<{
  'new-link': [link: LinkDetail];
  'link-updated': [payload: UpdateLinkValidation];
}>();

const APP_DOMAIN = useRuntimeConfig().public.appDomain;

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

const TABS = {
  detail: {
    title: 'Detail',
    icon: FileTextIcon,
  },
  rules: {
    title: 'Rules',
    icon: WorkflowIcon,
  },
  utm: {
    icon: MilestoneIcon,
    title: 'UTM Builder',
  },
  qrcode: {
    title: 'QR Code',
    icon: QrCodeIcon,
  },
} as const;

let targetObjUrl: URL | null = null;
let qrCodeStyling: QRCodeStyling | null = null;

const toast = useToast();
const isDesktop = useMediaQuery('(min-width: 768px)');
const {
  handleSubmit,
  values,
  isFieldValid,
  setFieldValue,
  setFieldError,
  isFieldDirty,
} = useForm({
  validationSchema: toTypedSchema(newLinkValidation),
  initialValues: props.defaultValue ?? {
    utmOptions: {},
    key: nanoid(6),
  },
  keepValuesOnUnmount: true,
});

const userStore = useUserStore();

const qrCodeElRef = ref<HTMLDivElement>();
const activeTab = shallowRef<keyof typeof TABS>('detail');

const state = shallowReactive({
  lockKey: true,
  isLoading: false,
  isQrValid: false,
});
const linkTarget = shallowReactive<{ valid: boolean; utmUrl: string }>({
  utmUrl: '',
  valid: false,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    state.isLoading = true;

    if (props.isEditing) {
      if (!props.linkId) return;

      let isEmpty = true;
      const updatePayload: UpdateLinkValidation = {};

      for (const _key in values) {
        const key = _key as keyof NewLinkValidation;
        if (isFieldDirty(key)) {
          isEmpty = false;
          // @ts-expect-error correct value!
          updatePayload[key] = values[key];
        }
      }
      if (isEmpty) return;

      await $fetch(`/api/links/${props.linkId}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });

      emit('link-updated', updatePayload);

      return;
    }

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
    state.isLoading = false;
  }
});

function unlockKey() {
  const confirm = window.confirm(
    'Editing the current short link will break the existing link. Continue?',
  );
  if (!confirm) return;

  state.lockKey = false;
}
function onUTMChanged(key: keyof LinkUTMOptionsValidation, value: string) {
  if (!linkTarget.valid || !targetObjUrl) return;

  if (!value.trim()) {
    targetObjUrl.searchParams.delete(LINK_UTM_QUERY_MAP[key]);
  } else {
    targetObjUrl.searchParams.set(LINK_UTM_QUERY_MAP[key], value);
  }
  linkTarget.utmUrl = targetObjUrl.href;
}
async function copyLinkQR() {
  if (!state.isQrValid || !qrCodeStyling) return;

  try {
    const blob = await qrCodeStyling.getRawData('png');
    if (!blob) return;

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob as Blob }),
    ]);
    toast.toast({
      title: 'QR code copied to clipboard',
    });
  } catch (error) {
    console.error(error);
    toast.toast({
      variant: 'destructive',
      title: 'Error copying QR code',
    });
  }
}
async function downloadLinkQR(type: 'png' | 'jpeg' | 'svg') {
  if (!state.isQrValid || !qrCodeStyling) return;

  try {
    await new QRCodeStyling({
      ...qrCodeStyling._options,
      width: 1024,
      height: 1024,
    }).download({
      extension: type,
      name: values.key,
    });
  } catch (error) {
    console.error(error);
    toast.toast({
      variant: 'destructive',
      title: 'Error downloading QR code',
    });
  }
}

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
  { debounce: 250, immediate: true },
);
watchDebounced(
  () => [values.key, values.qrOptions] as const,
  ([keyValue, qrOptions]) => {
    if (
      !keyValue?.trim() ||
      !isFieldValid('key') ||
      !isFieldValid('qrOptions') ||
      !qrCodeElRef.value
    ) {
      if (!qrCodeElRef.value || !state.isQrValid) return;

      state.isQrValid = false;

      return;
    }

    const data = `https://${APP_DOMAIN}/${keyValue}?qr=1`;
    const options: Partial<Options> = {
      image:
        userStore.profile.plan.name === APP_FREE_PLAN.id || qrOptions?.logo
          ? logoPng
          : undefined,
      backgroundOptions: {
        color: qrOptions?.bgColor,
      },
      dotsOptions: {
        color: qrOptions?.color,
      },
      cornersDotOptions: {
        type: qrOptions?.cornerDotType,
      },
      cornersSquareOptions: {
        type: qrOptions?.cornerSquareType,
      },
    };

    if (!qrCodeStyling) {
      qrCodeStyling = new QRCodeStyling({
        type: 'svg',
        width: 120,
        height: 120,
        data,
        ...options,
      });
      qrCodeStyling.append(qrCodeElRef.value);
    } else {
      qrCodeStyling.update({
        data,
        ...options,
      });
    }

    state.isQrValid = true;
  },
  { debounce: 250, immediate: true, deep: true },
);

onUnmounted(() => {
  qrCodeStyling = null;
});
</script>
<style scoped lang="postcss">
.custom-tabs {
  height: auto;
  display: block;
  background-color: transparent;

  button {
    width: 100%;
    display: flex;
    text-align: left;
    align-items: center;
    justify-content: start;
    height: theme('height.10');
    border-radius: theme('borderRadius.md');
    padding-left: theme('padding.2');
    padding-right: theme('padding.2');

    &[aria-selected='true'] {
      box-shadow: none;
      /* border: 1px solid theme('colors.border'); */
      background-color: theme('colors.secondary.DEFAULT');
    }

    &:hover {
      background-color: theme('colors.secondary.DEFAULT');
    }
  }
}
</style>
