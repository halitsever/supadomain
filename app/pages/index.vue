<script setup lang="ts">
import type { Domain } from "../types/domain.interface";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  title: "Domains",
});

const editModalStatus = ref(false);
const editingDomain = ref<Domain | null>(null);
const domains: Ref<Domain[]> = ref([]);

const listDomains = async () => {
  const { data, refresh } = await useFetch<Domain[]>("/api/domain/list");
  await refresh();
  if (Array.isArray(data.value)) domains.value = data.value;
  else domains.value = [];
};

function openEditModal(domain: Domain) {
  editingDomain.value = domain;
  editModalStatus.value = true;
}

async function removeDomain(url: string) {
  await useFetch("/api/domain/remove", {
    method: "DELETE",
    body: { url },
  });

  await listDomains();

  toast.success(`Domain removed - ${url}`, {
    description: "Domain removed successfully",
  });
}

await listDomains();
</script>

<template>
  <div class="flex flex-col p-6">
    <div class="flex justify-between mb-4">
      <h1>Manage Your Domains</h1>
      <AddDomainDialog @added="listDomains()" />
    </div>

    <EditDomainDialog v-model="editModalStatus" :domain="editingDomain" @updated="listDomains()" />

    <DomainTable :domains="domains" @edit="openEditModal" @remove="removeDomain" />
  </div>
</template>
