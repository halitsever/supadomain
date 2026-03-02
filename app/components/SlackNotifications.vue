<script setup lang="ts">
import { Slack } from "lucide-vue-next";
import { toast } from "vue-sonner";

const slackInput = ref("");

const setSlackNotifications = async (webhookUrl: string) => {
  const { data } = await useFetch("/api/notification/slack", {
    method: "POST",
    body: {
      webhookUrl: slackInput.value,
    },
  });

  if (data.value?.success)
    toast.success("Slack notification settings saved", {
      description: "Your Slack notification settings have been saved successfully.",
    });
  else
    toast.error("Failed to save Slack notification settings", {
      description: data?.value?.message || "An error occurred while saving your Slack notification settings.",
    });
};

const sendTestNotification = async () => {
  const { data } = await useFetch("/api/notification/slack/test-notification", {
    method: "POST",
  });

  if (data.value?.success)
    toast.success("Test Slack notification sent successfully", {
      description: "Your test Slack notification has been sent successfully.",
    });
  else
    toast.error("Failed to send test Slack notification", {
      description: data?.value?.message || "An error occurred while sending your test Slack notification.",
    });
};
</script>

<template>
  <div class="flex flex-col space-x-2">
    <div class="flex p-6 gap-4"><Slack class="text-sm" /> Slack Notifications</div>

    <div class="flex flex-col space-y-4 p-6">
      <Input v-model="slackInput" placeholder="https://hooks.slack.com/services/..." />

      <div class="flex gap-6">
        <Button @click="setSlackNotifications(slackInput)" class="cursor-pointer">Save</Button>
        <Button @click="sendTestNotification()" class="cursor-pointer" variant="secondary">Send Test Notification</Button>
      </div>
    </div>
  </div>
</template>
