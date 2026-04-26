<script setup lang="ts">
import { Slack } from "lucide-vue-next";
import { toast } from "vue-sonner";

const slackInput = ref("");

const { data: slackSettings } = await useFetch<{ success: boolean; webhookUrl: string | null }>("/api/notification/slack");
if (slackSettings.value?.webhookUrl) slackInput.value = slackSettings.value.webhookUrl;

const setSlackNotifications = async () => {
  const { data } = await useFetch("/api/notification/slack", {
    method: "POST",
    body: { webhookUrl: slackInput.value },
  });

  if (data.value?.success)
    toast.success("Slack notification settings saved");
  else
    toast.error("Failed to save Slack notification settings", {
      description: data?.value?.message || "An error occurred",
    });
};

const sendTestNotification = async () => {
  const { data } = await useFetch("/api/notification/slack/test-notification", {
    method: "POST",
  });

  if (data.value?.success)
    toast.success("Test Slack notification sent successfully");
  else
    toast.error("Failed to send test Slack notification", {
      description: data?.value?.message || "An error occurred",
    });
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center p-6 gap-3 border-b">
      <Slack class="size-5" />
      <span class="font-medium">Slack Notifications</span>
    </div>

    <div class="flex flex-col gap-4 p-6 max-w-lg">
      <div class="flex flex-col gap-1.5">
        <Label for="webhook-url">Webhook URL</Label>
        <Input
          id="webhook-url"
          v-model="slackInput"
          placeholder="https://hooks.slack.com/services/..."
        />
        <p v-if="slackSettings?.webhookUrl" class="text-xs text-muted-foreground">
          A webhook is currently configured.
        </p>
      </div>

      <div class="flex gap-3">
        <Button @click="setSlackNotifications()" class="cursor-pointer">Save</Button>
        <Button @click="sendTestNotification()" class="cursor-pointer" variant="secondary">
          Send Test Notification
        </Button>
      </div>
    </div>
  </div>
</template>
