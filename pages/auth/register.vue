<template>
  <div v-if="verifyEmail.show" class="max-w-md">
    <h1 class="font-serif text-4xl font-bold">Verify your email address</h1>
    <p class="mt-4 text-muted-foreground">
      We've sent a verification link to
      <b>{{ maskEmail(verifyEmail.email) }}</b
      >. Please check your email inbox.
    </p>
  </div>
  <div v-else>
    <h1 class="font-serif text-4xl font-bold">Create an Account</h1>
    <p class="mt-1 text-muted-foreground">
      Already have an account?
      <NuxtLink class="link-text underline" to="login"> Sign in </NuxtLink>
    </p>
    <form class="mt-14 space-y-8" @submit="onSubmit">
      <UiFormField v-slot="{ componentField }" name="name">
        <UiFormItem class="-mb-1">
          <UiFormLabel> Name </UiFormLabel>
          <UiFormControl>
            <UiInput v-bind="componentField" size="lg" placeholder="John Doe" />
          </UiFormControl>
          <UiFormDescription />
          <UiFormMessage />
        </UiFormItem>
      </UiFormField>
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
        <UiFormItem>
          <div class="flex items-center justify-between">
            <UiFormLabel> Password </UiFormLabel>
            <button
              type="button"
              tabindex="-1"
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
    <div class="center-line relative my-6 text-center text-muted-foreground">
      <span class="relative z-10 bg-background px-4">OR</span>
    </div>
    <UiButton
      size="lg"
      class="w-full gap-2"
      variant="secondary"
      :disabled="isRegistering"
      @click="registerByGoogle"
    >
      <img
        class="size-6"
        alt="Google logo"
        src="~/assets/svg/google-g-logo.svg"
      />
      <p>Register with Google</p>
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
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-vue-next';
import { newUserValidation } from '~/server/validation/auth-email.validation';

definePageMeta({
  layout: 'auth',
  middleware: ['no-auth'],
});

const supabase = useSupabaseClient();

const showPassword = shallowRef(false);
const isRegistering = shallowRef(false);
const verifyEmail = shallowReactive({ show: false, email: '' });
const alertError = shallowRef<{ title: string; description: string } | null>(
  null,
);

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
        emailRedirectTo: getRedirectURL(),
      },
    });
    if (result.error) {
      alertError.value = {
        title: 'Error when registering!',
        description: result.error.message,
      };
      return;
    }

    if (!result.data.session) {
      verifyEmail.show = true;
      verifyEmail.email = email;
      return;
    }

    await navigateTo('verify-email', { replace: true });
  } catch (error) {
    console.error(error);
    alertError.value = {
      title: 'Something went wrong!',
      description: (error as Error).message,
    };
  } finally {
    isRegistering.value = false;
  }
});

async function registerByGoogle() {
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
