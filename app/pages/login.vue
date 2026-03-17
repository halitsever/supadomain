<script setup lang="ts">
import { GalleryVerticalEnd } from "lucide-vue-next";
import LoginForm from "@/components/LoginForm.vue";

definePageMeta({
  middleware: "guest",
  layout: "none",
});
</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <a href="#" class="flex items-center gap-2 self-center font-medium">
        <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <img src="/logo.svg" alt="Supadomain Logo" />
        </div>
        Supadomain
      </a>
      <LoginForm />
    </div>
  </div>
</template>
