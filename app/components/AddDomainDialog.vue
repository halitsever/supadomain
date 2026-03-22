<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "vue-sonner";

const emit = defineEmits<{
  added: [];
}>();

const modalStatus = ref(false);
const newDomain = ref("");
const addButtonClicked = ref(false);

const validateDomain = (url: string): boolean => {
  const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
  return domainPattern.test(url);
};

const addNewDomain = async () => {
  if (!validateDomain(newDomain.value))
    return toast.error("Invalid domain format", {
      description: "Please enter a valid domain (e.g., www.example.com)",
    });

  addButtonClicked.value = true;

  const { data } = await useFetch("/api/domain/create", {
    method: "POST",
    body: { url: newDomain.value },
  });

  if (data.value?.success) {
    toast.success("Domain created", { description: "Domain created successfully" });
    emit("added");
  } else {
    toast.error("Failed to create domain", {
      description: data?.value?.message || "An error occurred while creating the domain",
    });
  }

  addButtonClicked.value = false;
  modalStatus.value = false;
  newDomain.value = "";
};
</script>

<template>
  <Dialog v-model:open="modalStatus">
    <DialogTrigger>
      <Button>Add new domain</Button>
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
          Add
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
