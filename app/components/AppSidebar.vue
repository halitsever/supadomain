<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";
import {
  LayoutDashboard, Globe, Bell, Settings, Search, Sun, Moon,
  ChevronsUpDown, LogOut,
} from "lucide-vue-next";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const props = defineProps<SidebarProps>();

const { user } = useUserSession();
const { fetch: refreshSession } = useUserSession();
const { isDark, toggle: toggleTheme } = useTheme();

const route = useRoute();

const cmdOpen = defineModel<boolean>("cmdOpen", { default: false });

const NuxtLink = resolveComponent('NuxtLink');

const { data: statsData } = await useFetch<{ success: boolean; stats: { total: number } }>(
  "/api/domain/stats",
  { lazy: true, server: false }
);
const domainCount = computed(() => statsData.value?.stats?.total ?? null);

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { id: "domains", label: "Domains", icon: Globe, url: "/" },
  { id: "notifications", label: "Notifications", icon: Bell, url: "/notifications" },
  { id: "settings", label: "Settings", icon: Settings, url: "/settings", disabled: true },
];

function isActive(url: string) {
  if (url === "/") return route.path === "/";
  return route.path.startsWith(url);
}

async function handleLogout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await refreshSession();
  await navigateTo("/login");
}
</script>

<template>
  <Sidebar v-bind="props" class="border-r border-border">
    <SidebarHeader class="px-4 pt-4 pb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="size-[26px] rounded-md bg-primary flex items-center justify-center shrink-0">
            <img src="/logo.svg" class="size-4" alt="Supadomain" />
          </div>
          <span class="font-semibold text-[14.5px] tracking-[-0.01em]">Supadomain</span>
        </div>
        <button
          class="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-120 cursor-pointer"
          :title="isDark ? 'Switch to light' : 'Switch to dark'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="size-[14px]" />
          <Moon v-else class="size-[14px]" />
        </button>
      </div>

      <button
        class="mt-3 w-full flex items-center justify-between gap-2 h-8 px-3 rounded-md border border-border bg-background text-muted-foreground text-[13px] hover:border-border/80 hover:bg-accent/50 transition-colors duration-120 cursor-pointer"
        @click="cmdOpen = true"
      >
        <span class="flex items-center gap-2">
          <Search class="size-[13px]" />
          Search…
        </span>
        <kbd class="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
      </button>
    </SidebarHeader>

    <SidebarContent class="px-3">
      <SidebarGroup>
        <SidebarGroupLabel class="text-[11px] uppercase tracking-[0.06em] font-semibold text-muted-foreground px-2 mb-1">
          Workspace
        </SidebarGroupLabel>
        <SidebarMenu class="gap-0.5">
          <SidebarMenuItem v-for="item in NAV" :key="item.id">
            <SidebarMenuButton
              as-child
              :is-active="isActive(item.url)"
            >
              <component
                :is="item.disabled ? 'span' : NuxtLink"
                v-bind="item.disabled ? {} : { to: item.url }"
                class="flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13.5px] font-medium transition-colors duration-120 w-full"
                :class="item.disabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : isActive(item.url)
                    ? 'bg-accent text-foreground shadow-[0_1px_0_rgba(17,17,26,0.04)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'"
              >
                <component
                  :is="item.icon"
                  class="size-[15px] shrink-0"
                  :class="item.disabled ? 'text-muted-foreground/40' : isActive(item.url) ? 'text-primary' : 'text-muted-foreground'"
                />
                <span class="flex-1">{{ item.label }}</span>
                <span
                  v-if="item.id === 'domains' && domainCount !== null"
                  class="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium"
                >
                  {{ domainCount }}
                </span>
              </component>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t border-border px-3 py-2.5">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton class="cursor-pointer">
                <div class="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-accent transition-colors duration-120">
                  <Avatar class="size-7 rounded-md shrink-0">
                    <AvatarFallback class="rounded-md text-[12px] font-semibold bg-primary/10 text-primary">
                      {{ user?.email?.charAt(0).toUpperCase() ?? "U" }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium truncate">{{ user?.email }}</div>
                    <div class="text-[11.5px] text-muted-foreground">
                      {{ domainCount !== null ? `${domainCount} domains` : "" }}
                    </div>
                  </div>
                  <ChevronsUpDown class="size-[14px] text-muted-foreground shrink-0" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[--reka-popper-anchor-width] min-w-52 rounded-lg" side="top" align="end" :side-offset="4">
              <DropdownMenuItem class="cursor-pointer" @click="handleLogout">
                <LogOut class="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
