<template>
  <header class="sticky top-0 h-16 w-full border-b bg-grass-12">
    <nav class="container flex h-full items-center text-grass-2">
      <h2 class="font-serif text-2xl font-bold">{{ APP_NAME }}</h2>
      <div class="grow"></div>
      <UiButton variant="ghost" as-child>
        <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/login`">
          Sign in
        </NuxtLink>
      </UiButton>
      <UiButton class="ml-4" as-child>
        <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/register`">
          Register
        </NuxtLink>
      </UiButton>
    </nav>
  </header>
  <div class="container h-96 min-h-[600px] pt-48">
    <h1 class="max-w-xl text-6xl font-bold leading-tight">
      Gain More Control Over Your Short Links.
    </h1>
    <p class="mt-6 text-lg text-muted-foreground">
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
    </p>
    <UiButton size="lg" class="mt-12 uppercase" as-child>
      <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/register`">
        Start for Free
      </NuxtLink>
    </UiButton>
  </div>
</template>
<script setup lang="ts">
import { APP_NAME } from '~/server/const/app.const';

definePageMeta({
  name: 'landing-page',
});

const APP_DOMAIN = useRuntimeConfig().public.appDomain;

const url = useRequestURL();
const user = useSupabaseUser();

if (url.hostname.startsWith('app.')) {
  await navigateTo(user ? '/dashboard' : '/auth/signin', { replace: true });
}
</script>
