<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";

import AppSidebar from "@/components/AppSidebar.vue";
import CommandPalette from "@/components/CommandPalette.vue";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-vue-next";

const route = useRoute();
const cmdOpen = ref(false);

const pageTitle = computed(() => route?.meta?.title as string | undefined ?? "");
</script>

<template>
  <SidebarProvider>
    <AppSidebar v-model:cmd-open="cmdOpen" />
    <SidebarInset>
      <header class="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between px-6 border-b border-border bg-background/85 backdrop-blur-[8px] backdrop-saturate-180">
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1 size-7 text-muted-foreground" />
          <Breadcrumb>
            <BreadcrumbList class="text-[13.5px]">
              <BreadcrumbItem>
                <BreadcrumbLink class="text-muted-foreground font-normal" href="/dashboard">Supadomain</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage class="font-medium text-foreground">{{ pageTitle }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div class="flex items-center gap-1">
          <button
            class="flex items-center gap-2 h-8 px-3 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-120 cursor-pointer"
            @click="cmdOpen = true"
          >
            <Search class="size-[13px]" />
            Search
            <kbd class="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>
          <NuxtLink
            to="/notifications"
            class="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-120"
          >
            <Bell class="size-[15px]" />
          </NuxtLink>
        </div>
      </header>

      <div class="flex-1 animate-in fade-in-0 slide-in-from-bottom-0.5 duration-200">
        <slot />
      </div>

      <Toaster :rich-colors="true" />
    </SidebarInset>
  </SidebarProvider>

  <CommandPalette v-model="cmdOpen" />
</template>
