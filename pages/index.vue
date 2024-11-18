<template>
  <header
    ref="headerRef"
    class="fixed top-0 w-full translate-y-4 transition-transform"
  >
    <div class="container">
      <nav
        class="flex size-full h-14 items-center rounded-lg border bg-grass-12 px-4 text-grass-1"
      >
        <h2 class="font-serif text-2xl font-bold">{{ APP_NAME }}</h2>
        <div class="grow"></div>
        <UiTooltipSimple label="GitHub repository">
          <a
            href="https://github.com/kholid060/sihai"
            class="mr-4 lg:mr-6"
            target="_blank"
          >
            <img class="size-6" src="~/assets/images/github-mark-white.png" />
          </a>
        </UiTooltipSimple>
        <UiButton
          variant="outline"
          class="hidden bg-inherit shadow-none md:flex"
          as-child
        >
          <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/login`">
            Sign in
          </NuxtLink>
        </UiButton>
        <UiButton class="ml-2 hidden md:flex" as-child>
          <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/register`">
            Register
          </NuxtLink>
        </UiButton>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger class="lg:hidden">
            <MenuIcon />
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end">
            <UiDropdownMenuItem as-child>
              <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/login`">
                Sign in
              </NuxtLink>
            </UiDropdownMenuItem>
            <UiDropdownMenuItem as-child>
              <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/register`">
                Register
              </NuxtLink>
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </nav>
    </div>
  </header>
  <section class="p-4">
    <div class="rounded-xl bg-gradient-to-b from-grass-3 from-70% to-grass-4">
      <div class="container flex flex-col items-center py-60 text-center">
        <h1 class="max-w-xl text-4xl font-bold leading-tight md:text-6xl">
          More Control Over Your Short Links.
        </h1>
        <p class="mt-6 max-w-md text-lg text-muted-foreground">
          Personalize your short link and control how it behaves using rules.
        </p>
        <UiButton size="lg" class="mt-16 text-base" as-child>
          <NuxtLink :to="`https://app.${APP_DOMAIN}/auth/register`">
            Start for Free
          </NuxtLink>
        </UiButton>
      </div>
    </div>
  </section>
  <section class="container">
    <UiCard class="-mt-24">
      <UiCardContent class="gap-8 p-6 lg:flex">
        <UiAccordion
          v-model="activeItem"
          type="single"
          class="shrink-0 lg:w-4/12"
        >
          <h3 class="mb-2 text-2xl font-semibold">See what's inside</h3>
          <UiAccordionItem
            v-for="item in accordionItems"
            :key="item.value"
            :value="item.value"
            class="text-muted-foreground"
          >
            <UiAccordionTrigger class="text-left font-sans">
              <div class="flex-1">
                <component
                  :is="item.icon"
                  class="mr-2 inline size-5 align-sub"
                />
                {{ item.title }}
              </div>
            </UiAccordionTrigger>
            <UiAccordionContent>
              {{ item.content }}
            </UiAccordionContent>
          </UiAccordionItem>
        </UiAccordion>
        <div class="mt-8 grow lg:mt-0">
          <div
            class="group relative aspect-video rounded-xl bg-secondary p-2 lg:p-3"
          >
            <img
              class="rounded-lg"
              :src="`/images/thumbnail/${activeItem}.png`"
            />
            <UiDialog>
              <UiDialogTrigger
                v-if="!accordionItems[activeItem].notVideo"
                class="absolute left-0 top-0 size-full"
              >
                <span
                  class="absolute top-1/2 -translate-x-1/2 rounded-full bg-primary/70 p-4 transition-transform group-hover:scale-125"
                >
                  <PlayIcon class="size-8" />
                </span>
              </UiDialogTrigger>
              <UiDialogContent
                blur
                class="w-auto max-w-none border-4 bg-transparent p-0"
              >
                <div
                  class="aspect-video w-screen md:h-96 md:w-auto lg:h-[600px]"
                >
                  <video
                    autoplay
                    controls
                    :src="`/videos/${activeItem}.mp4`"
                    class="size-full rounded-2xl"
                  />
                </div>
              </UiDialogContent>
            </UiDialog>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </section>
  <div class="h-32"></div>
</template>
<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import {
  BrushIcon,
  ChartColumnIcon,
  MenuIcon,
  PlayIcon,
  QrCodeIcon,
  SignpostIcon,
} from 'lucide-vue-next';
import { APP_NAME } from '~/server/const/app.const';

definePageMeta({
  name: 'landing-page',
});

const APP_DOMAIN = useRuntimeConfig().public.appDomain;

const accordionItems: Record<
  string,
  {
    icon: Component;
    value: string;
    title: string;
    content: string;
    notVideo?: boolean;
  }
> = {
  rule: {
    icon: SignpostIcon,
    value: 'rule',
    title: 'Short Link Rules',
    content:
      'Add rules to redirect your customers to the right place based on their geolocation, language, browser, and more.',
  },
  analytics: {
    icon: ChartColumnIcon,
    value: 'analytics',
    title: 'Analytics',
    notVideo: true,
    content:
      'Track your links with detailed insight, including device, geolocation, language, referrer, and top links information.',
  },
  'qr-code': {
    icon: QrCodeIcon,
    value: 'qr-code',
    title: 'QR Code Generator',
    content:
      'Free QR Code generator for your short link that you can customize.',
  },
  customize: {
    icon: BrushIcon,
    value: 'customize',
    title: 'Customize Destination Link',
    content:
      'Customize the destination link with the UTM builder or variable, it can help you define specific content or trace traffic information.',
  },
};

const url = useRequestURL();
const user = useSupabaseUser();

const activeItem = ref('rule');
const headerRef = ref<HTMLElement>();

if (url.hostname.startsWith('app.')) {
  await navigateTo(user ? '/dashboard' : '/auth/signin', { replace: true });
}

useEventListener('scroll', () => {
  const move = window.scrollY >= 50;
  if (!headerRef.value || (move && headerRef.value.dataset.move)) return;

  headerRef.value.style.transform = `translateY(${move ? 8 : 32}px)`;
  headerRef.value.toggleAttribute('data-move', move);
});
</script>
