<script setup lang="ts">
import { Slack } from "lucide-vue-next";

const slackInput = ref("");

const setSlackNotifications = async (webhookUrl: string) => {
  await $fetch("/api/notification/slack", {
    method: "POST",
    body: {
      webhookUrl: slackInput.value,
    },
  });
};

const sendTestNotification = async () => {
  await $fetch("/api/notification/slack/test-notification", {
    method: "POST",
  });
};
</script>

<template>
  <div class="flex flex-col space-x-2">
    <div class="flex p-6 gap-4"><Slack class="text-sm" /> Slack Notifications</div>

    <div class="flex flex-col space-y-4 p-6">
      <Input v-model="slackInput" placeholder="https://hooks.slack.com/services/..." />

      <div class="flex gap-6">
        <Button @click="setSlackNotifications(slackInput)">Save</Button>
        <Button @click="sendTestNotification()" variant="secondary">Send Test Notification</Button>
      </div>
    </div>
  </div>
</template>
