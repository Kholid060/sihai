<template>
  <div class="mx-auto mt-48 max-w-lg">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Create new password</UiCardTitle>
        <UiCardDescription>
          Your new password must be different from the previously used password.
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <form @submit="onSubmit">
          <UiFormField v-slot="{ componentField }" name="password">
            <UiFormItem>
              <div class="flex items-center justify-between">
                <UiFormLabel> Password </UiFormLabel>
                <button
                  tabindex="-1"
                  type="button"
                  class="link-text inline-flex items-center gap-1 text-sm"
                  @click="showPassword.main = !showPassword.main"
                >
                  <EyeOffIcon v-if="showPassword.main" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                  <span>{{ showPassword.main ? 'Hide' : 'Show' }}</span>
                </button>
              </div>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  :type="showPassword.main ? 'text' : 'password'"
                  size="lg"
                  class="bg-transparent"
                  placeholder="Password"
                />
              </UiFormControl>
              <UiFormDescription />
              <UiFormMessage />
            </UiFormItem>
          </UiFormField>
          <UiFormField v-slot="{ componentField }" name="confirmPassword">
            <UiFormItem class="mt-4">
              <div class="flex items-center justify-between">
                <UiFormLabel> Confirm password </UiFormLabel>
                <button
                  tabindex="-1"
                  type="button"
                  class="link-text inline-flex items-center gap-1 text-sm"
                  @click="showPassword.confirm = !showPassword.confirm"
                >
                  <EyeOffIcon v-if="showPassword.confirm" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                  <span>{{ showPassword.confirm ? 'Hide' : 'Show' }}</span>
                </button>
              </div>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  :type="showPassword.confirm ? 'text' : 'password'"
                  size="lg"
                  class="bg-transparent"
                  placeholder="Confirm password"
                />
              </UiFormControl>
              <UiFormDescription />
              <UiFormMessage />
            </UiFormItem>
          </UiFormField>
          <UiButton
            :is-loading="isLoading"
            class="mt-8 w-full"
            type="submit"
            size="lg"
          >
            Reset password
          </UiButton>
        </form>
      </UiCardContent>
    </UiCard>
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
</template>
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { XIcon, EyeOffIcon, EyeIcon } from 'lucide-vue-next';
import { newUserValidation } from '~/server/validation/auth-email.validation';

definePageMeta({
  middleware: ['verify-reset-password'],
});
useSeoMeta({
  title: 'Reset Password',
});

const supabase = useSupabaseClient();

const alertError = shallowRef<{ title: string; description: string } | null>(
  null,
);
const isLoading = shallowRef(false);

const showPassword = shallowReactive({
  main: false,
  confirm: false,
});

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({
        confirmPassword: z.string().min(1),
        password: newUserValidation.shape.password,
      })
      .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
          ctx.addIssue({
            code: 'custom',
            message: 'The passwords did not match',
            path: ['confirmPassword'],
          });
        }
      }),
  ),
});
const onSubmit = handleSubmit(async ({ password }) => {
  try {
    isLoading.value = true;

    const result = await supabase.auth.updateUser({
      password,
    });
    if (result.error) {
      alertError.value = {
        title: 'Error!',
        description: result.error.message,
      };
      console.error(result.error);
      return;
    }

    alertError.value = null;

    navigateTo('/dashboard', { replace: true });
  } catch (error) {
    console.error(error);
    alertError.value = {
      title: 'Something went wrong!',
      description: 'Try again in a few minutes.',
    };
  } finally {
    isLoading.value = false;
  }
});
</script>
