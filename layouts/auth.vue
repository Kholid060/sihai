<template>
  <div class="flex h-screen">
    <div class="hidden w-full max-w-xl content-end bg-grass-12 p-12 lg:block">
      <h2 class="cursor-default text-3xl font-semibold text-primary">Sihai</h2>
    </div>
    <div class="flex flex-1 items-center justify-center">
      <div class="w-full max-w-lg px-4">
        <slot />
      </div>
    </div>
  </div>
</template>
