<script setup lang="ts">
import { MessageSquare, Send, ExternalLink } from "lucide-vue-next";
import { Separator } from "@/components/ui/separator";
import { toast } from "vue-sonner";

definePageMeta({ middleware: "auth", title: "Notifications" });

const slackWebhook = ref("");
const slackError = ref("");
const slackSaving = ref(false);
const slackTesting = ref(false);

const { data: slackSettings } = await useFetch<{ success: boolean; webhookUrl: string | null }>("/api/notification/slack");
if (slackSettings.value?.webhookUrl) slackWebhook.value = slackSettings.value.webhookUrl;

const slackConfigured = computed(() => !!slackSettings.value?.webhookUrl);

function validateHttpsUrl(url: string) {
  if (!url) return "";
  if (!url.startsWith("https://")) return "URL must start with https://";
  return "";
}

async function saveSlack() {
  slackError.value = validateHttpsUrl(slackWebhook.value);
  if (slackError.value) return;
  slackSaving.value = true;
  const { data } = await useFetch("/api/notification/slack", { method: "POST", body: { webhookUrl: slackWebhook.value } });
  slackSaving.value = false;
  if (data.value?.success) toast.success("Slack webhook saved");
  else toast.error("Failed to save", { description: data.value?.message ?? "An error occurred" });
}

async function clearSlack() {
  slackWebhook.value = "";
  const { data } = await useFetch("/api/notification/slack", { method: "POST", body: { webhookUrl: "" } });
  if (data.value?.success) toast.success("Slack webhook cleared");
}

async function testSlack() {
  slackTesting.value = true;
  const { data } = await useFetch("/api/notification/slack/test-notification", { method: "POST" });
  slackTesting.value = false;
  if (data.value?.success) toast.success("Test notification sent to Slack");
  else toast.error("Failed to send test", { description: data.value?.message ?? "An error occurred" });
}
</script>

<template>
  <div class="p-6 pb-20 max-w-[880px] mx-auto">
    <!-- Header -->
    <div class="mb-[18px]">
      <h1 class="text-[22px] font-semibold tracking-[-0.02em] leading-tight">Notifications</h1>
      <p class="text-[13.5px] text-muted-foreground mt-1">
        Choose how and when Supadomain alerts you about expiring domains.
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <!-- Slack -->
      <div class="bg-card border border-border rounded-xl p-[18px] shadow-[0_1px_0_rgba(17,17,26,0.04)]">
        <div class="flex items-center gap-2.5 mb-3.5">
          <div class="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <MessageSquare class="size-4 text-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[14.5px] font-semibold">Slack</div>
            <div class="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span
                class="size-1.5 rounded-full"
                :class="slackConfigured ? 'bg-success' : 'bg-muted-foreground'"
              />
              {{ slackConfigured ? "Connected" : "Not configured" }}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            class="cursor-pointer text-[12px] shrink-0"
            :disabled="!slackWebhook || slackTesting"
            @click="testSlack"
          >
            <Send class="size-3 mr-1.5" />Send test
          </Button>
        </div>
        <Separator class="mb-4" />

        <div class="flex flex-col gap-1.5">
          <label class="text-[12.5px] font-medium text-foreground">Incoming webhook URL</label>
          <Input
            v-model="slackWebhook"
            placeholder="https://hooks.slack.com/services/…"
            class="font-mono text-[12.5px] h-9"
            @input="slackError = ''"
          />
          <p v-if="slackError" class="text-[12px] text-destructive">{{ slackError }}</p>
          <p v-else class="text-[12px] text-muted-foreground">
            {{ slackConfigured ? "A webhook is currently configured. Replace to point to a different channel." : "Paste your Slack incoming webhook URL." }}
            <a href="https://api.slack.com/messaging/webhooks" target="_blank" class="inline-flex items-center gap-0.5 text-primary hover:underline ml-1">
              Learn more <ExternalLink class="size-3" />
            </a>
          </p>
          <div class="flex gap-2 mt-2">
            <Button size="sm" class="cursor-pointer" :disabled="slackSaving" @click="saveSlack">
              {{ slackSaving ? "Saving…" : "Save" }}
            </Button>
            <Button variant="secondary" size="sm" class="cursor-pointer" :disabled="!slackWebhook" @click="clearSlack">
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
