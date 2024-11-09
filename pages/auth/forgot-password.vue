<template>
  <div v-if="isEmailSent">
    <h1 class="font-serif text-4xl font-bold">Email Sent</h1>
    <p class="mt-2 text-muted-foreground">
      A reset password instruction has been sent to your email address. Please
      check your email inbox.
    </p>
  </div>
  <div v-else>
    <h1 class="font-serif text-4xl font-bold">Forgot Your Password?</h1>
    <p class="mt-1 text-muted-foreground">
      Enter the email address you used to registered with.
    </p>
    <form class="mt-14 space-y-8" @submit="onSubmit">
      <UiFormField v-slot="{ componentField }" name="email">
        <UiFormItem>
          <UiFormLabel> Email </UiFormLabel>
          <UiFormControl>
            <UiInput
              v-bind="componentField"
              size="lg"
              placeholder="email@example.com"
            />
          </UiFormControl>
          <UiFormDescription />
          <UiFormMessage />
        </UiFormItem>
      </UiFormField>
      <div>
        <UiButton
          class="mt-4 w-full text-base"
          type="submit"
          size="lg"
          :is-loading="isLoading"
        >
          Reset Password
        </UiButton>
      </div>
    </form>
    <UiAlert v-if="alertError" class="mt-12" variant="destructive">
      <UiAlertTitle>{{ alertError.title }}</UiAlertTitle>
      <UiAlertDescription>{{ alertError.description }}</UiAlertDescription>
      <button
        class="absolute right-3 top-3 text-muted-foreground"
        @click="alertError = null"
      >
        <XIcon class="size-5" />
      </button>
    </UiAlert>
  </div>
  <p class="mt-12">
    <NuxtLink class="link-text underline" to="login">
      <ArrowLeftIcon class="mr-1 inline size-4" />
      Back to sign in
    </NuxtLink>
  </p>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { ArrowLeftIcon, XIcon } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth',
  middleware: ['no-auth'],
});
useSeoMeta({
  title: 'Forgot Password',
});

const supabase = useSupabaseClient();

const isLoading = shallowRef(false);
const isEmailSent = shallowRef(false);
const alertError = shallowRef<{ title: string; description: string } | null>(
  null,
);

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email(),
    }),
  ),
});
const onSubmit = handleSubmit(async ({ email }) => {
  try {
    isLoading.value = true;
    alertError.value = null;

    const result = await supabase.auth.resetPasswordForEmail(email);
    if (result.error) {
      alertError.value = {
        title: 'Error when registering!',
        description: result.error.message,
      };
      return;
    }

    isEmailSent.value = true;
  } catch (error) {
    console.error(error);
    alertError.value = {
      title: 'Something went wrong!',
      description: (error as Error).message,
    };
  } finally {
    isLoading.value = false;
  }
});
</script>
