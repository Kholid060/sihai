<template>
  <div v-if="error" class="px-4 pb-4">
    <UiStateError
      class="min-w-96"
      :title="
        error.statusCode === 404 ? 'Link Not Found' : 'Something went wrong'
      "
      :description="
        error.statusCode === 404
          ? ''
          : 'An error occurred when trying to fetch the link'
      "
    >
      <UiButton
        :is-loading="status === 'pending'"
        variant="secondary"
        class="mx-auto mt-6 min-w-32"
        @click="refresh"
      >
        Retry
      </UiButton>
    </UiStateError>
  </div>
  <div v-else-if="!data" class="p-4">
    <Loader2Icon class="animate-spin" />
  </div>
  <LazyDashboardNewLink
    v-else
    is-editing
    title="Update link"
    submit-label="Update link"
    :link-id="linkId"
    :default-value="data.data"
    @link-updated="onLinkUpdated"
  />
</template>
<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next';
import type { UpdateLinkValidation } from '~/server/validation/link.validation';

const props = defineProps<{ linkId: string }>();
const emits = defineEmits<{ updated: [] }>();

const linksStore = useLinksStore();

const { data, error, status, refresh } = await useFetch(
  `/api/links/${props.linkId}`,
);

function onLinkUpdated(data: UpdateLinkValidation) {
  linksStore.updateLinkList(props.linkId, data);
  emits('updated');
}
</script>
