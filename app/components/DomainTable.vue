<script setup lang="ts">
import { Trash2, Pencil, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-vue-next";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Domain } from "../types/domain.interface";
import { getDomainStatus, getDaysLeft, statusConfig } from "~/composables/useDomainStatus";

const PAGE_SIZE = 10;

const props = defineProps<{
  domains: Domain[];
  search: string;
  statusFilter?: string;
}>();

const emit = defineEmits<{
  edit: [domain: Domain];
  remove: [url: string];
  bulkRemove: [urls: string[]];
  openDrawer: [url: string];
}>();

type SortKey = "url" | "expireTime";
type SortDir = "asc" | "desc";

const deletingUrl = ref<string | null>(null);
const bulkDeleteOpen = ref(false);
const page = ref(1);
const sortKey = ref<SortKey>("expireTime");
const sortDir = ref<SortDir>("asc");
const selected = ref<Set<string>>(new Set());

const filteredDomains = computed(() => {
  const q = props.search.trim().toLowerCase();
  let list = props.domains;
  if (q) list = list.filter((d) => d.url.toLowerCase().includes(q));
  if (props.statusFilter && props.statusFilter !== "all") {
    list = list.filter((d) => getDomainStatus(d.expireTime) === props.statusFilter);
  }
  return [...list].sort((a, b) => {
    let A: string | number = "", B: string | number = "";
    if (sortKey.value === "url") { A = a.url; B = b.url; }
    if (sortKey.value === "expireTime") {
      A = a.expireTime ? new Date(a.expireTime).getTime() : Infinity;
      B = b.expireTime ? new Date(b.expireTime).getTime() : Infinity;
    }
    const cmp = A > B ? 1 : A < B ? -1 : 0;
    return sortDir.value === "asc" ? cmp : -cmp;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDomains.value.length / PAGE_SIZE)));
const pagedDomains = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredDomains.value.slice(start, start + PAGE_SIZE);
});

watch([() => props.search, () => props.statusFilter, () => props.domains], () => { page.value = 1; });

watch(() => props.domains, (newDomains) => {
  const existingIds = new Set(newDomains.map(d => d.id));
  const cleaned = new Set([...selected.value].filter(id => existingIds.has(id)));
  if (cleaned.size !== selected.value.size) selected.value = cleaned;
});

const allSelected = computed(() =>
  pagedDomains.value.length > 0 && pagedDomains.value.every((d) => selected.value.has(d.id))
);

function toggleAll() {
  if (allSelected.value) {
    pagedDomains.value.forEach((d) => selected.value.delete(d.id));
    selected.value = new Set(selected.value);
  } else {
    pagedDomains.value.forEach((d) => selected.value.add(d.id));
    selected.value = new Set(selected.value);
  }
}

function toggleRow(id: string) {
  const s = new Set(selected.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selected.value = s;
}

function setSortKey(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

function fmtDate(date: string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function doBulkDelete() {
  const urls = filteredDomains.value
    .filter((d) => selected.value.has(d.id))
    .map((d) => d.url);
  emit("bulkRemove", urls);
  selected.value = new Set();
  bulkDeleteOpen.value = false;
}
</script>

<template>
  <AlertDialog :open="!!deletingUrl" @update:open="(v) => { if (!v) deletingUrl = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove Domain</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to remove <strong class="font-mono">{{ deletingUrl }}</strong>? This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          <Button variant="outline" class="cursor-pointer" @click="deletingUrl = null">Cancel</Button>
        </AlertDialogCancel>
        <AlertDialogAction>
          <Button variant="destructive" class="cursor-pointer" @click="() => { emit('remove', deletingUrl!); deletingUrl = null }">
            Remove
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Bulk delete confirm -->
  <AlertDialog :open="bulkDeleteOpen" @update:open="(v) => { if (!v) bulkDeleteOpen = false }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove {{ selected.size }} domain{{ selected.size !== 1 ? "s" : "" }}</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently remove {{ selected.size }} selected domain{{ selected.size !== 1 ? "s" : "" }}. This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          <Button variant="outline" class="cursor-pointer" @click="bulkDeleteOpen = false">Cancel</Button>
        </AlertDialogCancel>
        <AlertDialogAction>
          <Button variant="destructive" class="cursor-pointer" @click="doBulkDelete">
            Remove
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Bulk action bar -->
  <div v-if="selected.size > 0" class="flex items-center gap-3 mb-3 px-3 py-2 bg-muted rounded-lg text-[12.5px]">
    <span class="text-muted-foreground">{{ selected.size }} selected</span>
    <Button
      variant="ghost"
      size="sm"
      class="h-7 text-[12px] text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
      @click="bulkDeleteOpen = true"
    >
      <Trash2 class="size-3 mr-1.5" />Delete
    </Button>
  </div>

  <div class="bg-card border border-border rounded-xl overflow-hidden shadow-[0_1px_0_rgba(17,17,26,0.04)]">
    <table class="w-full">
      <thead>
        <tr class="border-b border-border">
          <th class="w-8 px-4 py-2.5">
            <input
              type="checkbox"
              :checked="allSelected"
              class="rounded cursor-pointer"
              @change="toggleAll"
            />
          </th>
          <th
            class="text-left px-4 py-2.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.05em] cursor-pointer select-none hover:text-foreground transition-colors duration-120"
            @click="setSortKey('url')"
          >
            <span class="flex items-center gap-1">
              Domain
              <component :is="sortKey === 'url' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUp"
                class="size-3" :class="sortKey !== 'url' ? 'opacity-20' : ''" />
            </span>
          </th>
          <th class="text-left px-4 py-2.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">Status</th>
          <th
            class="text-left px-4 py-2.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.05em] cursor-pointer select-none hover:text-foreground transition-colors duration-120"
            @click="setSortKey('expireTime')"
          >
            <span class="flex items-center gap-1">
              Expires
              <component :is="sortKey === 'expireTime' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUp"
                class="size-3" :class="sortKey !== 'expireTime' ? 'opacity-20' : ''" />
            </span>
          </th>
          <th class="text-left px-4 py-2.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">Notifications</th>
          <th class="text-left px-4 py-2.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">Notify days</th>
          <th class="w-10 px-4 py-2.5"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="domain in pagedDomains"
          :key="domain.id"
          class="border-t border-border cursor-pointer transition-colors duration-120 hover:bg-muted/50 group"
          @click="emit('openDrawer', domain.url)"
        >
          <td class="px-4 py-3" @click.stop>
            <input
              type="checkbox"
              :checked="selected.has(domain.id)"
              class="rounded cursor-pointer"
              @change="toggleRow(domain.id)"
            />
          </td>

          <!-- Domain -->
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="size-2 rounded-full shrink-0"
                :class="statusConfig[getDomainStatus(domain.expireTime)].dotClass"
              />
              <span class="font-mono text-[13px] font-medium">{{ domain.url }}</span>
            </div>
          </td>

          <!-- Status -->
          <td class="px-4 py-3">
            <span
              class="inline-flex items-center text-[11.5px] font-medium px-2 py-0.5 rounded-full border"
              :class="statusConfig[getDomainStatus(domain.expireTime)].pillClass"
            >
              {{ statusConfig[getDomainStatus(domain.expireTime)].label }}
            </span>
          </td>

          <!-- Expires -->
          <td class="px-4 py-3">
            <div class="flex flex-col leading-[1.3]">
              <span class="text-[13px]">{{ fmtDate(domain.expireTime) }}</span>
              <span
                v-if="domain.expireTime"
                class="text-[11.5px]"
                :class="statusConfig[getDomainStatus(domain.expireTime)].textClass"
              >
                {{ getDaysLeft(domain.expireTime) !== null
                  ? (getDaysLeft(domain.expireTime)! < 0
                    ? `${Math.abs(getDaysLeft(domain.expireTime)!)}d ago`
                    : `${getDaysLeft(domain.expireTime)}d left`)
                  : '' }}
              </span>
            </div>
          </td>

          <!-- Notifications -->
          <td class="px-4 py-3">
            <span
              class="inline-flex items-center text-[11.5px] font-medium px-2 py-0.5 rounded-full border"
              :class="domain.notifications
                ? 'bg-success/10 text-success border-success/25'
                : 'bg-muted text-muted-foreground border-border'"
            >
              {{ domain.notifications ? "Enabled" : "Disabled" }}
            </span>
          </td>

          <!-- Notify days -->
          <td class="px-4 py-3">
            <span class="text-[12.5px] text-muted-foreground font-mono">
              {{ domain.notifyDaysBefore.join(", ") }}d
            </span>
          </td>

          <!-- Actions -->
          <td class="px-4 py-3" @click.stop>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-7 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-120"
                >
                  <MoreHorizontal class="size-[14px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44">
                <DropdownMenuItem class="cursor-pointer text-[13px]" @click="emit('edit', domain)">
                  <Pencil class="mr-2 size-3.5" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="cursor-pointer text-[13px] text-destructive focus:text-destructive focus:bg-destructive/10"
                  @click="deletingUrl = domain.url"
                >
                  <Trash2 class="mr-2 size-3.5" />Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>

        <tr v-if="pagedDomains.length === 0">
          <td colspan="7" class="px-4 py-12 text-center text-[13px] text-muted-foreground">
            No domains found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="totalPages > 1" class="flex items-center justify-between mt-3 text-[13px] text-muted-foreground">
    <span>{{ filteredDomains.length }} domain{{ filteredDomains.length !== 1 ? "s" : "" }} · page {{ page }} of {{ totalPages }}</span>
    <div class="flex gap-1">
      <Button variant="outline" size="icon" class="size-7 cursor-pointer" :disabled="page === 1" @click="page--">
        <ChevronLeft class="size-3.5" />
      </Button>
      <Button variant="outline" size="icon" class="size-7 cursor-pointer" :disabled="page === totalPages" @click="page++">
        <ChevronRight class="size-3.5" />
      </Button>
    </div>
  </div>
</template>
