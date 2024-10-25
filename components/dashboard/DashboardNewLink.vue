<template>
  <UiTabs default-value="detail">
    <div class="flex">
      <div class="w-64 px-3 py-4">
        <VisuallyHidden>Create new link</VisuallyHidden>
        <h2 class="text-lg font-bold">Create new link</h2>
        <UiTabsList class="custom-tabs mt-4 space-y-2">
          <UiTabsTrigger value="detail">
            <FileTextIcon class="mr-2 size-5" />
            Detail
          </UiTabsTrigger>
          <UiTabsTrigger value="rules">
            <WorkflowIcon class="mr-2 size-5" />
            Rules
          </UiTabsTrigger>
          <UiTabsTrigger value="utm">
            <MilestoneIcon class="mr-2 size-5" />
            UTM Builder
          </UiTabsTrigger>
          <UiTabsTrigger value="qrcode">
            <QrCodeIcon class="mr-2 size-5" />
            QR Code
          </UiTabsTrigger>
        </UiTabsList>
        <UiSeparator class="my-4" />
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
        class="flex min-h-[400px] w-screen max-w-xl grow flex-col rounded-lg bg-card p-6 shadow-sm"
        @submit="onSubmit"
      >
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="detail">
          <h3 class="mb-3 font-bold">Detail</h3>
          <div class="space-y-4">
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
                    {{ APP_DOMAIN }}/
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
            <UiFormField v-slot="{ componentField }" name="description">
              <UiFormItem>
                <UiFormLabel>Description (optional)</UiFormLabel>
                <UiTextarea
                  placeholder="Short description about the link"
                  v-bind="componentField"
                  class="bg-card"
                />
                <UiFormMessage />
                <UiFormDescription />
              </UiFormItem>
            </UiFormField>
          </div>
        </UiTabsContent>
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="rules">
          <h3 class="mb-3 font-bold">Rules</h3>
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
          <h3 class="mb-3 font-bold">QR Code</h3>
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
                <UiInput
                  v-bind="componentField"
                  placeholder="optional"
                  class="grow rounded-l-none bg-card"
                />
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
                <UiInput
                  v-bind="componentField"
                  placeholder="optional"
                  class="grow rounded-l-none bg-card"
                />
              </div>
              <UiFormMessage />
              <UiFormDescription />
            </UiFormItem>
          </UiFormField>
        </UiTabsContent>
        <UiTabsContent tabindex="-1" class="mt-0 grow" value="utm">
          <h3 class="mb-3 font-bold">UTM Builder</h3>
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
          <div class="grow"></div>
          <UiButton as-child variant="ghost">
            <UiDialogClose> Cancel </UiDialogClose>
          </UiButton>
          <UiButton type="submit" class="ml-4" :is-loading="state.isLoading">
            Create link
          </UiButton>
        </div>
      </form>
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
} from 'lucide-vue-next';
import {
  newLinkValidation,
  type LinkUTMOptionsValidation,
} from '~/server/validation/link.validation';
import { LINK_UTM_QUERY_MAP } from '~/server/const/link.const';
import { nanoid } from 'nanoid';
import { watchDebounced } from '@vueuse/core';
import { useToast } from '../ui/toast';
import type { LinkDetail } from '~/interface/link.interface';
import { APP_DOMAIN } from '~/server/const/app.const';
import { VisuallyHidden } from 'radix-vue';
import UiTooltipSimple from '~/components/ui/tooltip/TooltipSimple.vue';
import QRCodeStyling from 'qr-code-styling';
import logoPng from '~/assets/images/logo.png';

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
let qrCodeStyling: QRCodeStyling | null = null;

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

const qrCodeElRef = ref<HTMLCanvasElement>();

const state = shallowReactive({
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
  { debounce: 250 },
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

    if (!qrCodeStyling) {
      qrCodeStyling = new QRCodeStyling({
        type: 'svg',
        margin: 0,
        width: 120,
        height: 120,
        image: logoPng,
        backgroundOptions: {
          color: qrOptions?.bgColor,
        },
        dotsOptions: {
          color: qrOptions?.color,
        },
        data,
      });
      qrCodeStyling.append(qrCodeElRef.value);
    } else {
      qrCodeStyling.update({
        data,
        backgroundOptions: {
          color: qrOptions?.bgColor,
        },
        dotsOptions: {
          color: qrOptions?.color,
        },
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
