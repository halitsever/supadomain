<script setup lang="ts">
import { RefreshCw, ArrowLeft } from "lucide-vue-next";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  title: "Domain Detail",
});

const route = useRoute();
const url = decodeURIComponent(route.params.url as string);

const { data, refresh } = await useFetch<{
  success: boolean;
  domain: {
    id: string;
    url: string;
    lastChecked: string | null;
    expireTime: string | null;
    registrationDate: string | null;
    lastUpdate: string | null;
    lastUpdatedInRdap: string | null;
    notifications: boolean;
    notifyDaysBefore: number[];
    nameservers: string[];
  };
}>(`/api/domain/detail?url=${encodeURIComponent(url)}`);

const domain = computed(() => data.value?.domain);

const isRefreshing = ref(false);

async function refreshDomain() {
  isRefreshing.value = true;
  const { data: result } = await useFetch("/api/domain/refresh", {
    method: "POST",
    body: { url },
  });
  isRefreshing.value = false;

  if (result.value?.success) {
    toast.success("Domain refreshed");
    await refresh();
  } else {
    toast.error("Failed to refresh domain", { description: result.value?.message });
  }
}

function fmt(date: string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(expireTime: string | null) {
  if (!expireTime) return null;
  const days = (new Date(expireTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return { label: `Expired ${Math.abs(Math.floor(days))}d ago`, class: "text-destructive" };
  if (days <= 7) return { label: `${Math.floor(days)}d left`, class: "text-orange-500" };
  if (days <= 30) return { label: `${Math.floor(days)}d left`, class: "text-yellow-500" };
  return { label: `${Math.floor(days)}d left`, class: "text-green-600" };
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-2xl">
    <div class="flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft class="size-4" /> Back
      </NuxtLink>
      <Button variant="secondary" size="sm" :disabled="isRefreshing" @click="refreshDomain" class="cursor-pointer">
        <RefreshCw :class="['size-4 mr-1.5', isRefreshing && 'animate-spin']" />
        Refresh
      </Button>
    </div>

    <div v-if="!domain" class="text-muted-foreground text-sm">Domain not found.</div>

    <template v-else>
      <Card>
        <CardHeader>
          <CardTitle>{{ domain.url }}</CardTitle>
          <CardDescription v-if="daysUntil(domain.expireTime)" :class="daysUntil(domain.expireTime)!.class">
            {{ daysUntil(domain.expireTime)!.label }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-y-3 text-sm">
            <span class="text-muted-foreground">Expiry Date</span>
            <span>{{ fmt(domain.expireTime) }}</span>

            <span class="text-muted-foreground">Registration Date</span>
            <span>{{ fmt(domain.registrationDate) }}</span>

            <span class="text-muted-foreground">Last Changed</span>
            <span>{{ fmt(domain.lastUpdate) }}</span>

            <span class="text-muted-foreground">Last RDAP Update</span>
            <span>{{ fmt(domain.lastUpdatedInRdap) }}</span>

            <span class="text-muted-foreground">Last Checked</span>
            <span>{{ fmt(domain.lastChecked) }}</span>

            <span class="text-muted-foreground">Notifications</span>
            <span>{{ domain.notifications ? "Enabled" : "Disabled" }}</span>

            <span class="text-muted-foreground">Notify Before</span>
            <span>{{ domain.notifyDaysBefore.join(", ") }} days</span>
          </div>
        </CardContent>
      </Card>

      <Card v-if="domain.nameservers.length">
        <CardHeader>
          <CardTitle class="text-base">Nameservers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="flex flex-col gap-1.5">
            <li v-for="ns in domain.nameservers" :key="ns" class="text-sm font-mono">{{ ns }}</li>
          </ul>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
