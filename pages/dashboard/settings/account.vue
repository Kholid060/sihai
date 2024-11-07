<template>
  <UiCard class="max-w-4xl">
    <UiCardHeader>
      <UiCardTitle>Display name</UiCardTitle>
    </UiCardHeader>
    <form @submit.prevent="updateName">
      <UiCardContent>
        <UiCardDescription class="mb-2">
          Name that will be used within the app
        </UiCardDescription>
        <UiInput v-model="formNameState.value" class="max-w-sm bg-inherit" />
      </UiCardContent>
      <UiCardFooter class="block md:flex">
        <UiButton
          type="submit"
          :is-loading="formNameState.isLoading"
          :disabled="
            formNameState.value.length < DB_USER_NAME_LENGTH.min ||
            formNameState.value.length > DB_USER_NAME_LENGTH.max ||
            formNameState.value === userStore.profile.name
          "
          variant="secondary"
          >Save changes
        </UiButton>
        <div class="grow"></div>
        <p class="mt-2 text-sm text-muted-foreground md:mt-0">
          Min {{ DB_USER_NAME_LENGTH.min }} and max
          {{ DB_USER_NAME_LENGTH.max }} characters
        </p>
      </UiCardFooter>
    </form>
  </UiCard>
  <UiCard class="mt-6 max-w-4xl">
    <UiCardHeader>
      <UiCardTitle>Change password</UiCardTitle>
    </UiCardHeader>
    <UiCardContent v-if="!formPasswordState.hasEmailProvider">
      <p class="text-muted-foreground">
        You must create an account using email and password to change password
      </p>
    </UiCardContent>
    <form v-else @submit.prevent="updatePassword">
      <UiCardContent class="space-y-3">
        <fieldset>
          <UiLabel for="old-password">Current password</UiLabel>
          <UiInput
            id="old-password"
            v-model="formPasswordState.currentPassword"
            type="password"
            class="max-w-sm bg-inherit"
          />
        </fieldset>
        <fieldset>
          <UiLabel for="new-password">New password</UiLabel>
          <UiInput
            id="new-password"
            v-model="formPasswordState.newPassword"
            type="password"
            class="max-w-sm bg-inherit"
          />
        </fieldset>
        <fieldset>
          <UiLabel for="confirm-password">Confirm new password</UiLabel>
          <UiInput
            id="confirm-password"
            v-model="formPasswordState.confirmPassword"
            type="password"
            class="max-w-sm bg-inherit"
          />
        </fieldset>
      </UiCardContent>
      <UiCardFooter class="block md:flex">
        <UiButton
          type="submit"
          :is-loading="formPasswordState.isLoading"
          :disabled="
            formPasswordState.newPassword.length < DB_USER_NAME_LENGTH.min ||
            formPasswordState.newPassword.length > DB_USER_NAME_LENGTH.max ||
            formPasswordState.currentPassword.length < 1 ||
            formPasswordState.newPassword !== formPasswordState.confirmPassword
          "
          variant="secondary"
          >Save changes
        </UiButton>
        <div class="grow"></div>
        <p class="mt-2 text-sm text-muted-foreground md:mt-0">
          Min {{ DB_USER_PASSWORD_LENGTH.min }} and max
          {{ DB_USER_PASSWORD_LENGTH.max }} characters
        </p>
      </UiCardFooter>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { useToast } from '~/components/ui/toast';
import {
  DB_USER_NAME_LENGTH,
  DB_USER_PASSWORD_LENGTH,
} from '~/server/const/db.const';

const toast = useToast();
const user = useSupabaseUser();

const userStore = useUserStore();

const formNameState = shallowReactive({
  isLoading: false,
  value: userStore.profile.name,
});
const formPasswordState = shallowReactive({
  newPassword: '',
  isLoading: false,
  currentPassword: '',
  confirmPassword: '',
  hasEmailProvider: false,
});

async function updateName() {
  if (formNameState.isLoading) return;

  try {
    formNameState.isLoading = true;

    await $fetch('/api/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: formNameState.value }),
    });
    toast.toast({ title: 'Success', description: 'Password updated' });

    formPasswordState.newPassword = '';
    formPasswordState.currentPassword = '';
    formPasswordState.confirmPassword = '';
  } catch (error) {
    toast.toast({
      ...getFetchError(error),
      variant: 'destructive',
    });
  } finally {
    formNameState.isLoading = false;
  }
}
async function updatePassword() {
  if (formPasswordState.isLoading) return;

  try {
    formPasswordState.isLoading = true;

    const { newPassword, confirmPassword, currentPassword } = formPasswordState;
    await $fetch('/api/me/reset-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmPassword, currentPassword }),
    });
  } catch (error) {
    toast.toast({
      ...getFetchError(error),
      variant: 'destructive',
    });
  } finally {
    formPasswordState.isLoading = false;
  }
}

onMounted(() => {
  formPasswordState.hasEmailProvider =
    user.value?.identities?.some((identity) => identity.provider === 'email') ??
    false;
});
</script>
