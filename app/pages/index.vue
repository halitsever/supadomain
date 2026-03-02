<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-vue-next";
import type { Domain } from "../types/domain.interface";
import { toast } from "vue-sonner";

definePageMeta({
  title: "Domains",
});

const modalStatus = ref(false);
const newDomain = ref("");
const addButtonClicked = ref(false);

const domains: Ref<Domain[]> = ref([]);

/**
 * Fetches the list of domains being tracked from the server and updates the local state with the retrieved data.
 * @returns A promise that resolves when the domain list has been successfully fetched and updated.
 */
const listDomains = async () => {
  const { data, refresh } = await useFetch<Domain[]>("/api/domain/list");
  await refresh();
  if (Array.isArray(data.value)) domains.value = data.value;
  else domains.value = [];
};

/**
 * Adds a new domain to the tracking list by sending a POST request to the server with the specified URL.
 * @returns A promise that resolves when the domain has been added successfully.
 */
const addNewDomain = async () => {
  if (!validateDomain(newDomain.value))
    return toast.error("Invalid domain format", {
      description: "Please enter a valid domain (e.g., www.example.com)",
    });

  addButtonClicked.value = true;

  const { data } = await useFetch("/api/domain/create", {
    method: "POST",
    body: {
      url: newDomain.value,
    },
  });

  if (data.value?.success)
    toast.success("Domain created", {
      description: "Domain created successfully",
    });
  else
    toast.error("Failed to create domain", {
      description: data?.value?.message || "An error occurred while creating the domain",
    });

  await listDomains();
  addButtonClicked.value = false;
  modalStatus.value = false;
};

/**
 * Removes a domain from the tracking list by sending a DELETE request to the server with the specified URL.
 * @param url - The URL of the domain to be removed.
 * @returns A promise that resolves when the domain has been removed successfully.
 */
async function removeDomain(url: string) {
  const { data } = await useFetch("/api/domain/remove", {
    method: "DELETE",
    body: {
      url: url,
    },
  });

  await listDomains();

  toast.success(`Domain removed - ${url}`, {
    description: "Domain removed successfully",
  });
}

const validateDomain = (url: string): boolean => {
  const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
  return domainPattern.test(url);
};

await listDomains();
</script>

<template>
  <div class="flex flex-col p-6">
    <div class="flex justify-between mb-4">
      <h1>Manage Your Domains</h1>

      <Dialog v-model:open="modalStatus">
        <DialogTrigger>
          <Button> Add new domain </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new Domain</DialogTitle>
            <DialogDescription>
              <Label for="domain">Domain URL</Label>

              <Input v-model="newDomain" id="domain" type="text" placeholder="www.example.com" />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button :disabled="addButtonClicked" type="submit" @click="addNewDomain()" class="cursor-pointer">
              <Spinner v-if="addButtonClicked" />
              Add</Button
            >
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div>
      <Table>
        <TableCaption>Total {{ domains.length }} domains listed</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead> Domain </TableHead>
            <TableHead>Expire Time</TableHead>
            <TableHead>Notifications</TableHead>
            <TableHead class="text-right"> Actions </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="domain in domains" :key="domain.id">
            <TableCell class="font-medium">
              {{ domain.url }}
            </TableCell>
            <TableCell>
              <div>
                <div>
                  {{ domain.expireTime ? new Date(domain.expireTime).toLocaleDateString() : "N/A" }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="domain.notifications ? 'default' : 'destructive'">
                {{ domain.notifications ? "Enabled" : "Disabled" }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <Button class="cursor-pointer" variant="secondary" size="icon" @click="removeDomain(domain.url)"><Trash class="size-4" /></Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
