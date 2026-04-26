<script setup lang="ts">
import type { TabsListProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { TabsList } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<TabsListProps & { class?: HTMLAttributes["class"] }>()
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    :class="cn('bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1', props.class)"
    v-bind="props"
  >
    <slot />
  </TabsList>
</template>
