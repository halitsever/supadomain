<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { ChevronUp, LogOut, Shield } from "lucide-vue-next";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMenuStore } from "~/stores/menu.store";

const props = defineProps<SidebarProps>();
const router = useRouter();

const menuStore = useMenuStore();

const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://github.com/shadcn.png",
};

const data = {
  navMain: menuStore.list(),
};

function handleLogout() {
  router.push("/login");
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Shield class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">Track My Domain</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in data.navMain" :key="item.title">
            <SidebarMenuButton as-child>
              <a :href="item.url" class="font-medium">
                {{ item.title }}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg">
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarImage :src="user.avatar" :alt="user.name" />
                  <AvatarFallback class="rounded-lg">
                    {{
                      user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{ user.name }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{ user.email }}</span>
                </div>
                <ChevronUp class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[--reka-popper-anchor-width] min-w-56 rounded-lg" side="top" align="end" :side-offset="4">
              <DropdownMenuItem @click="handleLogout">
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
