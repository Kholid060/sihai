<template>
  <h1 class="text-4xl font-bold font-serif">
    Welcome Back!
  </h1>
  <p class="text-muted-foreground mt-1">
    Don't have an account? <NuxtLink
      class="link-text underline"
      to="register"
    >
      Register
    </NuxtLink>
  </p>
  <form
    class="mt-14"
    @submit="onSubmit"
  >
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
      <UiFormItem class="mt-8 group">
        <div class="flex items-center justify-between">
          <UiFormLabel>
            Password
          </UiFormLabel>
          <button
            tabindex="-1"
            type="button"
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
        <NuxtLink
          to="forgot-password"
          class="float-right link-text underline"
        >
          Forgot Password?
        </NuxtLink>
        <UiFormDescription />
        <UiFormMessage />
      </UiFormItem>
    </UiFormField>
    <UiButton
      class="mt-14 w-full text-base"
      type="submit"
      size="lg"
    >
      Sign In
    </UiButton>
  </form>
  <div class="center-line relative text-center my-6 text-muted-foreground">
    <span class="bg-background px-4 z-10 relative">OR</span>
  </div>
  <UiButton
    class="w-full gap-2"
    variant="secondary"
  >
    <img
      class="size-6"
      alt="Google logo"
      src="~/assets/svg/google-g-logo.svg"
    >
    <p>Sign In with Google</p>
  </UiButton>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth',
});

const showPassword = shallowRef(false);

const formSchema = toTypedSchema(z.object({
  email: z.string().email(),
  password: z.string().min(1),
}));

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit((values) => {
  console.log(values);
});
</script>
