<script setup lang="ts">
import { X, ExternalLink, Bell, Trash2, ArrowUpRight } from "lucide-vue-next";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { getDomainStatus, getDaysLeft, statusConfig } from "~/composables/useDomainStatus";
import { toast } from "vue-sonner";

const props = defineProps<{ domainUrl: string | null }>();
const emit = defineEmits<{ close: []; removed: [url: string] }>();

const isOpen = computed(() => !!props.domainUrl);

interface DomainDetail {
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
}

const detailData = ref<{ success: boolean; domain: DomainDetail } | null>(null);
const pending = ref(false);

async function loadDomain(url: string) {
  pending.value = true;
  try {
    const result = await $fetch<{ success: boolean; domain: DomainDetail }>(
      `/api/domain/detail?url=${encodeURIComponent(url)}`
    );
    detailData.value = result;
  } catch {
    detailData.value = null;
  } finally {
    pending.value = false;
  }
}

watch(() => props.domainUrl, (v) => { if (v) loadDomain(v); else detailData.value = null; });

const domain = computed(() => detailData.value?.domain);
const status = computed(() => getDomainStatus(domain.value?.expireTime ?? null));
const daysLeft = computed(() => getDaysLeft(domain.value?.expireTime ?? null));
const cfg = computed(() => statusConfig[status.value]);

function fmt(date: string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeftLabel() {
  if (daysLeft.value === null) return "Unknown";
  if (daysLeft.value < 0) return `Expired ${Math.abs(daysLeft.value)}d ago`;
  return `${daysLeft.value} days`;
}

async function removeDomain() {
  if (!domain.value) return;
  await $fetch("/api/domain/remove", { method: "DELETE", body: { url: domain.value.url } });
  toast.success(`Domain removed — ${domain.value.url}`);
  emit("removed", domain.value.url);
  emit("close");
}
</script>

<template>
  <Sheet :open="isOpen" @update:open="(v) => { if (!v) emit('close') }">
    <SheetContent
      side="right"
      class="p-0 flex flex-col gap-0 w-full sm:max-w-[560px] overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-5 py-[18px] border-b border-border shrink-0">
        <div v-if="pending" class="size-2 rounded-full bg-muted-foreground animate-pulse" />
        <span
          v-else
          class="size-2 rounded-full shrink-0"
          :class="cfg.dotClass"
        />
        <div class="flex-1 min-w-0">
          <div class="font-mono text-[16px] font-semibold tracking-[-0.01em] truncate">
            {{ domainUrl ?? "—" }}
          </div>
          <div v-if="domain" class="text-[12px] text-muted-foreground mt-0.5">
            {{ fmt(domain.expireTime) }} · {{ daysLeftLabel() }}
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          class="cursor-pointer text-[12px] shrink-0"
          as-child
        >
          <NuxtLink :to="`/domain/${encodeURIComponent(domainUrl ?? '')}`" @click="emit('close')">
            Details
            <ArrowUpRight class="size-3 ml-1.5" />
          </NuxtLink>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          class="cursor-pointer text-[12px] shrink-0"
          as-child
        >
          <a :href="`https://lookup.icann.org/en/lookup?name=${domainUrl}`" target="_blank" rel="noopener">
            <ExternalLink class="size-3 mr-1.5" />
            WHOIS
          </a>
        </Button>
        <button
          class="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-120 cursor-pointer"
          @click="emit('close')"
        >
          <X class="size-[14px]" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5 space-y-3">
        <!-- Status card -->
        <div class="bg-card border border-border rounded-xl p-3.5">
          <div class="text-[11px] uppercase tracking-[0.06em] font-semibold text-muted-foreground mb-2.5">Status</div>
          <span
            class="inline-flex items-center text-[12px] font-medium px-2 py-0.5 rounded-full border"
            :class="cfg.pillClass"
          >{{ cfg.label }}</span>

          <div class="mt-3.5 grid grid-cols-2 gap-3">
            <div v-for="row in [
              { label: 'Expiration', value: fmt(domain?.expireTime ?? null) },
              { label: 'Time remaining', value: daysLeftLabel() },
              { label: 'Registration date', value: fmt(domain?.registrationDate ?? null) },
              { label: 'Notifications', value: domain?.notifications ? 'Enabled' : 'Disabled' },
              { label: 'Last RDAP update', value: fmt(domain?.lastUpdatedInRdap ?? null) },
              { label: 'Last checked', value: fmt(domain?.lastChecked ?? null) },
            ]" :key="row.label" class="flex flex-col gap-1 min-w-0">
              <span class="text-[11.5px] text-muted-foreground uppercase tracking-[0.05em] font-medium">{{ row.label }}</span>
              <span class="text-[13px] truncate">{{ row.value }}</span>
            </div>

            <div v-if="domain?.nameservers?.length" class="col-span-2 flex flex-col gap-1">
              <span class="text-[11.5px] text-muted-foreground uppercase tracking-[0.05em] font-medium">Nameservers</span>
              <div class="flex flex-col gap-0.5">
                <span v-for="ns in domain.nameservers" :key="ns" class="font-mono text-[12.5px]">{{ ns }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="bg-card border border-border rounded-xl p-3.5">
          <div class="text-[11px] uppercase tracking-[0.06em] font-semibold text-muted-foreground mb-2.5">Quick actions</div>
          <div class="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" class="cursor-pointer text-[12px]" as-child>
              <NuxtLink to="/notifications" @click="emit('close')">
                <Bell class="size-3 mr-1.5" />Configure alerts
              </NuxtLink>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="cursor-pointer text-[12px] text-destructive hover:text-destructive hover:bg-destructive/10"
              @click="removeDomain"
            >
              <Trash2 class="size-3 mr-1.5" />Remove
            </Button>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
