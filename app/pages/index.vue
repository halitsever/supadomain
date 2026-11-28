<script setup lang="ts">
import type { Domain } from "../types/domain.interface";
import { toast } from "vue-sonner";
import { Search, Download } from "lucide-vue-next";
import { getDomainStatus } from "~/composables/useDomainStatus";

definePageMeta({ middleware: "auth", title: "Domains" });

const editModalStatus = ref(false);
const editingDomain = ref<Domain | null>(null);
const drawerDomain = ref<string | null>(null);
const search = ref("");
const statusFilter = ref<string>("all");

const { data: domainData, refresh: refreshDomains } = await useFetch<Domain[]>("/api/domain/list");
const domains = computed(() => Array.isArray(domainData.value) ? domainData.value : []);

const FILTERS = computed(() => [
  { id: "all",      label: "All",      count: domains.value.length },
  { id: "healthy",  label: "Healthy",  count: domains.value.filter(d => getDomainStatus(d.expireTime) === "healthy").length },
  { id: "warning",  label: "Warning",  count: domains.value.filter(d => getDomainStatus(d.expireTime) === "warning").length },
  { id: "critical", label: "Critical", count: domains.value.filter(d => getDomainStatus(d.expireTime) === "critical").length },
  { id: "expired",  label: "Expired",  count: domains.value.filter(d => getDomainStatus(d.expireTime) === "expired").length },
  { id: "unknown",  label: "Unknown",  count: domains.value.filter(d => getDomainStatus(d.expireTime) === "unknown").length },
].filter(f => f.id !== "unknown" || f.count > 0));

function openEditModal(domain: Domain) {
  editingDomain.value = domain;
  editModalStatus.value = true;
}

// The sidebar shows the domain count, so it reloads with the list.
async function reloadDomains() {
  await Promise.all([refreshDomains(), refreshNuxtData("sidebar-stats")]);
}

async function deleteDomain(url: string) {
  try {
    const result = await $fetch<{ success: boolean }>("/api/domain/remove", { method: "DELETE", body: { url } });
    return result.success;
  } catch {
    return false;
  }
}

async function removeDomain(url: string) {
  const removed = await deleteDomain(url);
  await reloadDomains();
  if (removed) toast.success(`Domain removed: ${url}`);
  else toast.error(`Failed to remove ${url}`);
}

async function bulkRemoveDomains(urls: string[]) {
  const results = await Promise.all(urls.map(deleteDomain));
  const removed = results.filter(Boolean).length;
  await reloadDomains();
  if (removed) toast.success(`Removed ${removed} domain${removed !== 1 ? "s" : ""}`);
  if (removed < urls.length) toast.error(`Failed to remove ${urls.length - removed} domain${urls.length - removed !== 1 ? "s" : ""}`);
}

function exportCSV() {
  const headers = ["Domain", "Status", "Expiry Date", "Days Left", "Last Checked", "Notifications", "Notify Before (days)"];
  const rows = domains.value.map(d => [
    d.url,
    getDomainStatus(d.expireTime),
    d.expireTime ? new Date(d.expireTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
    getDaysLeft(d.expireTime) !== null ? String(getDaysLeft(d.expireTime)) : "N/A",
    d.lastChecked ? new Date(d.lastChecked).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
    d.notifications ? "Yes" : "No",
    d.notifyDaysBefore.join(", "),
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `domains-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="p-6 pb-20 max-w-[1280px] mx-auto">
    <!-- Header -->
    <div class="flex items-end justify-between mb-[18px] gap-4">
      <div>
        <h1 class="text-[22px] font-semibold tracking-[-0.02em] leading-tight">Domains</h1>
        <p class="text-[13.5px] text-muted-foreground mt-1">
          {{ domains.length }} domain{{ domains.length !== 1 ? "s" : "" }} tracked.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" size="sm" class="cursor-pointer" :disabled="!domains.length" @click="exportCSV">
          <Download class="size-3.5 mr-1.5" />Export
        </Button>
        <AddDomainDialog @added="reloadDomains()" />
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-2 mb-3 flex-wrap">
      <div class="relative flex-1 max-w-[320px]">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground" />
        <Input v-model="search" placeholder="Search domains…" class="pl-8 h-8 text-[13px]" />
      </div>

      <div class="flex gap-0.5 p-0.5 bg-muted rounded-lg">
        <button
          v-for="f in FILTERS"
          :key="f.id"
          class="h-[26px] px-2.5 rounded-md text-[12.5px] font-medium transition-all duration-120 cursor-pointer flex items-center gap-1.5"
          :class="statusFilter === f.id
            ? 'bg-background text-foreground shadow-[0_1px_0_rgba(17,17,26,0.04)]'
            : 'text-muted-foreground hover:text-foreground'"
          @click="statusFilter = f.id"
        >
          {{ f.label }}
          <span class="text-[11px] opacity-70">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <EditDomainDialog v-model="editModalStatus" :domain="editingDomain" @updated="refreshDomains()" />

    <DomainTable
      :domains="domains"
      :search="search"
      :status-filter="statusFilter"
      @edit="openEditModal"
      @remove="removeDomain"
      @bulk-remove="bulkRemoveDomains"
      @open-drawer="drawerDomain = $event"
    />

    <DomainDrawer
      :domain-url="drawerDomain"
      @close="drawerDomain = null"
      @removed="reloadDomains()"
    />
  </div>
</template>
