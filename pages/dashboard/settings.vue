<template>
  <DashboardHeading>Settings</DashboardHeading>
  <UiTabs
    :model-value="route.path.slice(BASE_PATH.length)"
    @update:model-value="navigateTo($event as string)"
  >
    <UiTabsList type="single" class="mt-10 justify-start text-muted-foreground">
      <UiTabsTrigger
        v-for="setting in settings"
        :key="setting.path"
        :value="setting.path"
      >
        {{ setting.label }}
      </UiTabsTrigger>
    </UiTabsList>
  </UiTabs>
  <main class="mt-8">
    <NuxtPage />
  </main>
</template>
<script setup lang="ts">
const BASE_PATH = '/dashboard/settings/';
const settings: { label: string; path: string }[] = [
  { label: 'Account', path: 'account' },
  { label: 'Billing', path: 'billing' },
];

const route = useRoute();
</script>
