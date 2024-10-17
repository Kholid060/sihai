<template>
  <h1 class="font-serif text-4xl font-bold">Welcome Back!</h1>
  <p class="mt-1 text-muted-foreground">
    Don't have an account?
    <NuxtLink class="link-text underline" to="register"> Register </NuxtLink>
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
    <UiFormField v-slot="{ componentField }" name="password">
      <UiFormItem class="group">
        <div class="flex items-center justify-between">
          <UiFormLabel> Password </UiFormLabel>
          <button
            tabindex="-1"
            type="button"
            class="link-text inline-flex items-center gap-1 text-sm"
            @click="showPassword = !showPassword"
          >
            <EyeOffIcon v-if="showPassword" class="size-4" />
            <EyeIcon v-else class="size-4" />
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
        <div class="text-right">
          <NuxtLink to="forgot-password" class="link-text underline">
            Forgot Password?
          </NuxtLink>
        </div>
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
        Sign In
      </UiButton>
    </div>
  </form>
  <div class="center-line relative my-6 text-center text-muted-foreground">
    <span class="relative z-10 bg-background px-4">OR</span>
  </div>
  <UiButton
    class="w-full gap-2"
    variant="secondary"
    :disabled="isLoading"
    @click="signInByGoogle"
  >
    <img
      class="size-6"
      alt="Google logo"
      src="~/assets/svg/google-g-logo.svg"
    />
    <p>Sign In with Google</p>
  </UiButton>
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
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth',
  middleware: ['no-auth'],
});

const supabase = useSupabaseClient();

const isLoading = shallowRef(false);
const showPassword = shallowRef(false);
const alertError = shallowRef<{ title: string; description: string } | null>(
  null,
);

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async ({ email, password }) => {
  try {
    isLoading.value = true;

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (result.error) {
      alertError.value = {
        title: 'Error!',
        description: result.error.message,
      };
      return;
    }

    alertError.value = null;

    await navigateTo('/dashboard', { replace: true });
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

async function signInByGoogle() {
  try {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectURL() },
    });
    if (result.error) {
      alertError.value = {
        title: 'Error!',
        description: result.error.message,
      };
      return;
    }
  } catch (error) {
    if (error instanceof Error) {
      alertError.value = {
        description: error.message,
        title: 'Something went wrong!',
      };
    }

    console.error(error);
  }
}
</script>
