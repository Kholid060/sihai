<template>
  <UiBadge v-if="userStore.profile.plan.name === APP_FREE_PLAN.id">Pro</UiBadge>
</template>
<script lang="ts" setup>
import { APP_FREE_PLAN } from '~/server/const/app.const';

const userStore = useUserStore();
</script>
