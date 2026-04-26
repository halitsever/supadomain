<script setup lang="ts">
import {
  Globe, AlertTriangle, AlertCircle, Clock, CheckCircle2, HelpCircle,
  RefreshCw, ChevronRight, Bell, RefreshCcw, Plus,
} from "lucide-vue-next";
import { getDomainStatus, getDaysLeft, statusConfig } from "~/composables/useDomainStatus";
import type { ActivityKind } from "~/types/activity.interface";

definePageMeta({ middleware: "auth", title: "Dashboard" });

interface ActivityEntry {
  domainUrl: string;
  kind: ActivityKind;
  message: string;
  createdAt: string;
}

const { data, refresh, pending } = await useFetch<{
  success: boolean;
  stats: { total: number; expired: number; critical: number; warning: number; healthy: number; unknown: number };
  soonest: { url: string; expireTime: string }[];
  activity: ActivityEntry[];
}>("/api/domain/stats");

const stats = computed(() => data.value?.stats);
const soonest = computed(() => data.value?.soonest ?? []);
const activity = computed(() => data.value?.activity ?? []);

const statCards = computed(() => [
  { label: "Total",    value: stats.value?.total    ?? 0, status: "total" as StatStatus,    icon: Globe,         trend: stats.value?.total ? `${stats.value.total} tracked` : null },
  { label: "Expired",  value: stats.value?.expired  ?? 0, status: "expired" as StatStatus,  icon: AlertTriangle, trend: null },
  { label: "Critical", value: stats.value?.critical ?? 0, status: "critical" as StatStatus, icon: AlertCircle,   trend: "≤ 7 days" },
  { label: "Warning",  value: stats.value?.warning  ?? 0, status: "warning" as StatStatus,  icon: Clock,         trend: "≤ 30 days" },
  { label: "Healthy",  value: stats.value?.healthy  ?? 0, status: "healthy" as StatStatus,  icon: CheckCircle2,  trend: null },
  { label: "Unknown",  value: stats.value?.unknown  ?? 0, status: "unknown" as StatStatus,  icon: HelpCircle,    trend: null },
]);

type StatStatus = "total" | "expired" | "critical" | "warning" | "healthy" | "unknown";

const statColor: Record<StatStatus, string> = {
  total:    "text-foreground",
  expired:  "text-destructive",
  critical: "text-critical",
  warning:  "text-warning",
  healthy:  "text-success",
  unknown:  "text-muted-foreground",
};
const statIconColor: Record<StatStatus, string> = {
  total:    "text-muted-foreground",
  expired:  "text-destructive",
  critical: "text-critical",
  warning:  "text-warning",
  healthy:  "text-success",
  unknown:  "text-muted-foreground",
};

function fmt(expireTime: string) {
  return new Date(expireTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const activityIcon: Record<ActivityKind, typeof Bell> = {
  alert:   AlertTriangle,
  expired: AlertCircle,
  refresh: RefreshCcw,
  added:   CheckCircle2,
  removed: AlertTriangle,
};
const activityColor: Record<ActivityKind, string> = {
  alert:   "text-destructive",
  expired: "text-destructive",
  refresh: "text-muted-foreground",
  added:   "text-success",
  removed: "text-muted-foreground",
};
const activityBg: Record<ActivityKind, string> = {
  alert:   "bg-destructive/10",
  expired: "bg-destructive/10",
  refresh: "bg-muted",
  added:   "bg-success/10",
  removed: "bg-muted",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const activePeriod = ref("30d");

const { data: growthData } = await useFetch(() => `/api/domain/growth?period=${activePeriod.value}`);

const W = 1100, H = 140, P = 8;

const chartPoints = computed(() => {
  const raw = growthData.value?.points?.map(p => p.count) ?? [];
  return raw.length >= 2 ? raw : Array(2).fill(0);
});

const pts = computed<[number, number][]>(() => {
  const vals = chartPoints.value;
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const stepX = (W - P * 2) / (vals.length - 1);
  return vals.map((v, i) => [P + i * stepX, P + (H - P * 2) - ((v - min) / range) * (H - P * 2)]);
});

const chartPath = computed(() =>
  pts.value.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ")
);
const chartArea = computed(() => {
  const p = pts.value;
  return chartPath.value + ` L${p[p.length - 1]![0]},${H} L${p[0]![0]},${H} Z`;
});
const chartEnd = computed<[number, number]>(() => pts.value[pts.value.length - 1] as [number, number]);

const chartDates = computed(() => growthData.value?.points ?? []);
const chartLatestCount = computed(() => chartDates.value[chartDates.value.length - 1]?.count ?? 0);
</script>

<template>
  <div class="p-6 pb-20 max-w-[1280px] mx-auto">
    <!-- Header -->
    <div class="flex items-end justify-between mb-5 gap-4">
      <div>
        <h1 class="text-[22px] font-semibold tracking-[-0.02em] leading-tight">Dashboard</h1>
        <p class="text-[13.5px] text-muted-foreground mt-1">Overview of your domain portfolio.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" size="sm" class="cursor-pointer" :disabled="pending" @click="refresh()">
          <RefreshCw :class="['size-3.5 mr-1.5', pending && 'animate-spin']" />
          Refresh
        </Button>
        <Button size="sm" class="cursor-pointer" as-child>
          <NuxtLink to="/">
            <Plus class="size-3.5 mr-1.5" />
            Add domain
          </NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Stat grid -->
    <div class="grid grid-cols-6 gap-3 mb-5">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-card border border-border rounded-xl p-4 flex flex-col gap-3.5 min-h-[116px] shadow-[0_1px_0_rgba(17,17,26,0.04)]"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12.5px] font-medium text-muted-foreground">{{ card.label }}</span>
          <component :is="card.icon" class="size-[14px]" :class="statIconColor[card.status as keyof typeof statIconColor]" />
        </div>
        <div class="flex items-baseline justify-between gap-2">
          <span
            class="text-[26px] font-semibold tracking-[-0.02em] leading-none"
            :class="statColor[card.status as keyof typeof statColor]"
          >{{ card.value }}</span>
          <span v-if="card.trend" class="text-[11px] text-muted-foreground">{{ card.trend }}</span>
        </div>
      </div>
    </div>

    <!-- Two-column row -->
    <div class="grid gap-4 mb-4" style="grid-template-columns: 1.6fr 1fr">
      <!-- Expiring soonest -->
      <div class="bg-card border border-border rounded-xl overflow-hidden shadow-[0_1px_0_rgba(17,17,26,0.04)]">
        <div class="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div>
            <div class="text-[14px] font-semibold">Expiring soonest</div>
            <div class="text-[12px] text-muted-foreground mt-0.5">Next {{ soonest.length }} domains closest to expiration</div>
          </div>
          <Button variant="ghost" size="sm" class="cursor-pointer text-[12px]" as-child>
            <NuxtLink to="/">
              View all
              <ChevronRight class="size-3 ml-0.5" />
            </NuxtLink>
          </Button>
        </div>
        <div>
          <div v-if="soonest.length === 0" class="px-4 py-8 text-[13px] text-muted-foreground text-center">
            No domains tracked yet.
          </div>
          <div
            v-for="(d, i) in soonest"
            :key="d.url"
            class="grid items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors duration-120 hover:bg-muted/50"
            :class="i > 0 ? 'border-t border-border' : ''"
            style="grid-template-columns: 1fr auto auto auto"
            @click="navigateTo('/')"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span
                class="size-1.5 rounded-full shrink-0"
                :class="statusConfig[getDomainStatus(d.expireTime)].dotClass"
              />
              <span class="font-mono text-[13px] font-medium truncate">{{ d.url }}</span>
            </div>
            <span class="text-[12px] text-muted-foreground font-mono">{{ fmt(d.expireTime) }}</span>
            <span
              class="text-[11.5px] font-medium px-2 py-0.5 rounded-full border"
              :class="statusConfig[getDomainStatus(d.expireTime)].pillClass"
            >
              {{ statusConfig[getDomainStatus(d.expireTime)].label }}
            </span>
            <span
              class="text-[13px] font-medium text-right min-w-[60px]"
              :class="(getDaysLeft(d.expireTime) ?? 0) <= 7 ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ getDaysLeft(d.expireTime) !== null ? (getDaysLeft(d.expireTime)! < 0 ? `${Math.abs(getDaysLeft(d.expireTime)!)}d ago` : `${getDaysLeft(d.expireTime)}d left`) : 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="bg-card border border-border rounded-xl overflow-hidden shadow-[0_1px_0_rgba(17,17,26,0.04)]">
        <div class="px-4 py-3.5 border-b border-border">
          <div class="text-[14px] font-semibold">Recent activity</div>
          <div class="text-[12px] text-muted-foreground mt-0.5">Last 10 events</div>
        </div>
        <div class="py-1.5">
          <div v-if="activity.length === 0" class="px-4 py-8 text-[13px] text-muted-foreground text-center">
            No activity yet.
          </div>
          <div v-for="(a, i) in activity" :key="i" class="flex items-start gap-2.5 px-4 py-2.5">
            <div
              class="size-6 rounded-md flex items-center justify-center shrink-0"
              :class="activityBg[a.kind]"
            >
              <component :is="activityIcon[a.kind]" class="size-[12.5px]" :class="activityColor[a.kind]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] leading-[1.4]">{{ a.message }}</div>
              <div class="text-[11.5px] text-muted-foreground mt-0.5">{{ timeAgo(a.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio growth chart -->
    <div class="bg-card border border-border rounded-xl p-[18px] shadow-[0_1px_0_rgba(17,17,26,0.04)]">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-[14px] font-semibold">Portfolio growth</div>
          <div class="text-[12px] text-muted-foreground mt-0.5">{{ chartLatestCount }} domains tracked</div>
        </div>
        <div class="flex gap-1 p-0.5 bg-muted rounded-lg">
          <button
            v-for="p in ['7d', '30d', '90d', 'All']"
            :key="p"
            class="text-[12px] h-[26px] px-2.5 rounded-md font-medium transition-all duration-120 cursor-pointer"
            :class="activePeriod === p
              ? 'bg-background text-foreground shadow-[0_1px_0_rgba(17,17,26,0.04)]'
              : 'text-muted-foreground hover:text-foreground'"
            @click="activePeriod = p"
          >
            {{ p }}
          </button>
        </div>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-[140px] block">
        <defs>
          <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.18" />
            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line v-for="t in [0.25, 0.5, 0.75]" :key="t"
          :x1="P" :x2="W - P"
          :y1="P + (H - P * 2) * t" :y2="P + (H - P * 2) * t"
          stroke="var(--color-border)" stroke-dasharray="3 4"
        />
        <path :d="chartArea" fill="url(#chartGrad)" />
        <path :d="chartPath" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" />
        <circle :cx="chartEnd[0]" :cy="chartEnd[1]" r="3.5" fill="var(--color-primary)" stroke="var(--color-background)" stroke-width="2" />
      </svg>
      <div v-if="chartDates.length >= 2" class="flex justify-between mt-1.5">
        <span class="text-[11px] text-muted-foreground">{{ chartDates[0]?.date }}</span>
        <span class="text-[11px] text-muted-foreground">{{ chartDates[chartDates.length - 1]?.date }}</span>
      </div>
    </div>
  </div>
</template>
