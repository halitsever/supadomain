<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Domain } from "../types/domain.interface";
import { toast } from "vue-sonner";

const props = defineProps<{
  modelValue: boolean;
  domain: Domain | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  updated: [];
}>();

const editNotifications = ref(false);

watch(
  () => props.domain,
  (domain) => {
    if (domain) editNotifications.value = domain.notifications;
  }
);

const updateDomain = async () => {
  if (!props.domain) return;

  const { data } = await useFetch("/api/domain/update", {
    method: "PUT",
    body: {
      url: props.domain.url,
      notifications: editNotifications.value,
    },
  });

  if (data.value?.success) {
    toast.success("Domain updated", { description: "Domain updated successfully" });
    emit("updated");
  } else {
    toast.error("Failed to update domain");
  }

  emit("update:modelValue", false);
};
</script>

<template>
  <Dialog :open="modelValue" @update:open="emit('update:modelValue', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Domain</DialogTitle>
        <DialogDescription>{{ domain?.url }}</DialogDescription>
      </DialogHeader>
      <div class="flex items-center gap-3 py-2">
        <Switch :modelValue="editNotifications" @click="editNotifications = !editNotifications" id="edit-notifications" />
        <Label for="edit-notifications">Notifications</Label>
      </div>
      <DialogFooter>
        <Button @click="updateDomain()" class="cursor-pointer">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
