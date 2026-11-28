<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "vue-sonner";

const emit = defineEmits<{
  added: [];
}>();

const modalStatus = ref(false);
const newDomain = ref("");
const addButtonClicked = ref(false);

const addNewDomain = async () => {
  if (addButtonClicked.value) return;

  if (!normalizeDomain(newDomain.value))
    return toast.error("Invalid domain format", {
      description: "Please enter a valid domain (e.g., example.com)",
    });

  addButtonClicked.value = true;

  try {
    const result = await $fetch<{ success: boolean; message?: string }>("/api/domain/create", {
      method: "POST",
      body: { url: newDomain.value },
    });

    if (result.success) {
      toast.success("Domain created", { description: "Domain created successfully" });
      emit("added");
      modalStatus.value = false;
      newDomain.value = "";
    } else {
      toast.error("Failed to create domain", {
        description: result.message || "An error occurred while creating the domain",
      });
    }
  } catch {
    toast.error("Failed to create domain", { description: "The server could not be reached" });
  } finally {
    addButtonClicked.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="modalStatus">
    <DialogTrigger as-child>
      <Button size="sm" class="cursor-pointer">
        <span class="mr-1 text-[13px] font-semibold">+</span> Add domain
      </Button>
    </DialogTrigger>
    <DialogContent>
      <form class="grid gap-4" @submit.prevent="addNewDomain()">
        <DialogHeader>
          <DialogTitle>Add new Domain</DialogTitle>
          <DialogDescription>The expiry date is read over RDAP when you add the domain.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-2">
          <Label for="domain">Domain</Label>
          <Input v-model="newDomain" id="domain" type="text" placeholder="example.com" autocomplete="off" />
        </div>
        <DialogFooter>
          <Button :disabled="addButtonClicked" type="submit" class="cursor-pointer">
            <Spinner v-if="addButtonClicked" />
            Add
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
