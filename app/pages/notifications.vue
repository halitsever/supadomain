<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "Notifications",
});
</script>

<template>
  <div>
    <SlackNotifications />
  </div>
</template>
