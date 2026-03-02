<script setup lang="ts">
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

definePageMeta({
  title: "Notifications",
});
</script>

<template>
  <div class="flex items-center space-x-2 p-6">
    <Switch id="airplane-mode" />
    <Label for="airplane-mode">Enable Notifications</Label>
  </div>
</template>
