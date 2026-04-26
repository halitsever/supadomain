<script setup lang="ts">
import { AlertDialogRoot } from "reka-ui"

const props = defineProps<{
  open?: boolean
  defaultOpen?: boolean
}>()

const emits = defineEmits<{
  "update:open": [value: boolean]
}>()
</script>

<template>
  <AlertDialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    @update:open="emits('update:open', $event)"
  >
    <slot />
  </AlertDialogRoot>
</template>
