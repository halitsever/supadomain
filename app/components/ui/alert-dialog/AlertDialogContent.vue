<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { AlertDialogContent, AlertDialogPortal } from "reka-ui"
import { cn } from "@/lib/utils"
import AlertDialogOverlay from "./AlertDialogOverlay.vue"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogContent
      :class="cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
        props.class
      )"
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
