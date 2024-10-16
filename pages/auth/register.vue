<template>
  <h1 class="text-4xl font-bold font-serif">
    Create an Account
  </h1>
  <p class="text-muted-foreground mt-1">
    Already have an account? <NuxtLink
      class="link-text underline"
      to="login"
    >
      Sign in
    </NuxtLink>
  </p>
  <form
    class="mt-14 space-y-8"
    @submit="onSubmit"
  >
    <UiFormField
      v-slot="{ componentField }"
      name="name"
    >
      <UiFormItem>
        <UiFormLabel>
          Name
        </UiFormLabel>
        <UiFormControl>
          <UiInput
            v-bind="componentField"
            size="lg"
            placeholder="John Doe"
          />
        </UiFormControl>
        <UiFormDescription />
        <UiFormMessage />
      </UiFormItem>
    </UiFormField>
    <UiFormField
      v-slot="{ componentField }"
      name="email"
    >
      <UiFormItem>
        <UiFormLabel>
          Email
        </UiFormLabel>
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
    <UiFormField
      v-slot="{ componentField }"
      name="password"
    >
      <UiFormItem>
        <div class="flex items-center justify-between">
          <UiFormLabel>
            Password
          </UiFormLabel>
          <button
            type="button"
            tabindex="-1"
            class="inline-flex text-sm items-center gap-1 link-text"
            @click="showPassword = !showPassword"
          >
            <EyeOffIcon
              v-if="showPassword"
              class="size-4"
            />
            <EyeIcon
              v-else
              class="size-4"
            />
            <span>{{ showPassword ? 'Hide' : 'Show' }}</span>
          </button>
        </div>
        <UiFormControl>
          <UiInput
            v-bind="componentField"
            :type="showPassword ? 'text' : 'password'"
            size="lg"
            placeholder="Password"
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
        :is-loading="isRegistering"
      >
        Register
      </UiButton>
    </div>
  </form>
  <div class="center-line relative text-center my-6 text-muted-foreground ">
    <span class="bg-background px-4 z-10 relative">OR</span>
  </div>
  <UiButton
    class="w-full gap-2"
    variant="secondary"
    :disabled="isRegistering"
  >
    <img
      class="size-6"
      alt="Google logo"
      src="~/assets/svg/google-g-logo.svg"
    >
    <p>Register with Google</p>
  </UiButton>
  <UiAlert v-if="alertError" class="mt-12" variant="destructive">
    <UiAlertTitle>{{ alertError.title }}</UiAlertTitle>
    <UiAlertDescription>{{ alertError.description }}</UiAlertDescription>
    <button class="absolute top-3 right-3 text-muted-foreground" @click="alertError = null">
      <XIcon class="size-5" />
    </button>
  </UiAlert>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-vue-next';
import { newUserValidation } from '~/server/validation/auth/auth-email.validation';
import { useToast } from '~/components/ui/toast';

definePageMeta({
  layout: 'auth',
});

const toast = useToast();
const supabase = useSupabaseClient();

const showPassword = shallowRef(false);
const isRegistering = shallowRef(false);
const alertError = shallowRef<{ title: string; description: string } | null>(null);

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(newUserValidation),
});
const onSubmit = handleSubmit(async ({ email, name, password }) => {
  try {
    alertError.value = null;
    isRegistering.value = true;

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, email },
      },
    });
    if (result.error) {
      alertError.value = {
        title: 'Error when registering!',
        description: result.error.message,
      };
      return;
    }

    await navigateTo('verify-email', { replace: true });
  } catch (error) {
    console.error(error);
    alertError.value = {
      title: 'Something went wrong!',
      description: (<Error>error).message,
    };
  } finally {
    isRegistering.value = false;
  }
});
</script>
