<script setup lang="ts">
import { LayoutDashboard, Globe, Bell, Settings, Search, ChevronRight } from "lucide-vue-next";

const isOpen = defineModel<boolean>({ default: false });

const NAV_ITEMS = [
  { label: "Dashboard", hint: "Navigate", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Domains", hint: "Navigate", icon: Globe, path: "/" },
  { label: "Notifications", hint: "Navigate", icon: Bell, path: "/notifications" },
];

const query = ref("");
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const filtered = computed(() => {
  if (!query.value) return NAV_ITEMS;
  const q = query.value.toLowerCase();
  return NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q));
});

watch(isOpen, (v) => {
  if (v) {
    query.value = "";
    activeIndex.value = 0;
    nextTick(() => inputRef.value?.focus());
  }
});

watch(filtered, () => { activeIndex.value = 0; });

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") { isOpen.value = false; return; }
  if (e.key === "ArrowDown") { e.preventDefault(); activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1); return; }
  if (e.key === "ArrowUp") { e.preventDefault(); activeIndex.value = Math.max(activeIndex.value - 1, 0); return; }
  if (e.key === "Enter") { selectItem(filtered.value[activeIndex.value]); }
}

function selectItem(item: (typeof NAV_ITEMS)[number] | undefined) {
  if (!item) return;
  isOpen.value = false;
  navigateTo(item.path);
}

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKey);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKey);
});

function handleGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[14vh]"
        @click.self="isOpen = false"
      >
        <div
          class="bg-background border border-border rounded-xl shadow-[0_4px_16px_rgba(17,17,26,0.12),0_1px_2px_rgba(17,17,26,0.08)] w-full max-w-[560px] overflow-hidden"
          @keydown="onKeydown"
        >
          <div class="flex items-center gap-3 px-4 border-b border-border h-[50px]">
            <Search class="size-4 text-muted-foreground shrink-0" />
            <input
              ref="inputRef"
              v-model="query"
              placeholder="Search domains, jump to a page…"
              class="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div class="max-h-[360px] overflow-y-auto py-1">
            <div v-if="filtered.length === 0" class="px-4 py-6 text-center text-[13px] text-muted-foreground">
              No results
            </div>
            <button
              v-for="(item, i) in filtered"
              :key="item.path"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 text-left transition-colors duration-100"
              :class="i === activeIndex ? 'bg-accent' : 'hover:bg-accent/50'"
              @mouseenter="activeIndex = i"
              @click="selectItem(item)"
            >
              <component :is="item.icon" class="size-[15px] text-muted-foreground shrink-0" />
              <span class="flex-1 text-[13.5px]">{{ item.label }}</span>
              <span class="text-[11.5px] text-muted-foreground">{{ item.hint }}</span>
            </button>
          </div>

          <div class="flex items-center gap-3.5 px-3.5 py-2 border-t border-border text-[11.5px] text-muted-foreground">
            <span><kbd class="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">↑↓</kbd> navigate</span>
            <span><kbd class="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">↵</kbd> select</span>
            <span><kbd class="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
