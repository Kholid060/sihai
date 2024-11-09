<template>
  <div
    v-if="query.status.value === 'error' && query.error.value"
    class="px-4 pb-4"
  >
    <UiStateError
      class="min-w-96"
      title="Something went wrong"
      description="An error occurred when trying to fetch the link"
    >
      <UiButton
        :is-loading="query.isLoading.value"
        variant="secondary"
        class="mx-auto mt-6 min-w-32"
        @click="query.refetch()"
      >
        Retry
      </UiButton>
    </UiStateError>
  </div>
  <div
    v-else-if="query.status.value === 'pending' || !query.data.value"
    class="p-4"
  >
    <Loader2Icon class="animate-spin" />
  </div>
  <LazyDashboardNewLink
    v-else
    is-editing
    title="Update link"
    submit-label="Update link"
    :link-id="linkId"
    :default-value="query.data.value.data"
    @link-updated="onLinkUpdated"
  />
</template>
<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { Loader2Icon } from 'lucide-vue-next';
import type { UpdateLinkValidation } from '~/server/validation/link.validation';

const props = defineProps<{ linkId: string }>();
const emits = defineEmits<{ updated: [] }>();

const queryClient = useQueryClient();
const query = useQuery({
  queryKey: ['link-detail', props.linkId],
  queryFn: () => $fetch(`/api/links/${props.linkId}`),
});

function onLinkUpdated(data: UpdateLinkValidation) {
  queryClient.setQueryData(['link-detail', props.linkId], {
    ...query.data.value,
    data: {
      ...query.data.value!.data,
      ...data,
    },
  });
  emits('updated');
}
</script>
