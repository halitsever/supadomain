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
const editNotifyDays = ref<number[]>([]);

const THRESHOLD_OPTIONS = [30, 7, 1] as const;

// Unsaved edits are dropped each time the dialog opens.
watch(
  () => [props.modelValue, props.domain] as const,
  ([open, domain]) => {
    if (open && domain) {
      editNotifications.value = domain.notifications;
      editNotifyDays.value = [...(domain.notifyDaysBefore ?? [30, 7, 1])];
    }
  }
);

function toggleThreshold(days: number) {
  const idx = editNotifyDays.value.indexOf(days);
  if (idx === -1) editNotifyDays.value.push(days);
  else editNotifyDays.value.splice(idx, 1);
}

const updateDomain = async () => {
  if (!props.domain) return;

  try {
    const result = await $fetch<{ success: boolean; message?: string }>("/api/domain/update", {
      method: "PUT",
      body: {
        url: props.domain.url,
        notifications: editNotifications.value,
        notifyDaysBefore: editNotifyDays.value,
      },
    });

    if (!result.success) return toast.error("Failed to update domain", { description: result.message });

    toast.success("Domain updated", { description: "Domain updated successfully" });
    emit("updated");
    emit("update:modelValue", false);
  } catch {
    toast.error("Failed to update domain", { description: "The server could not be reached" });
  }
};
</script>

<template>
  <Dialog :open="modelValue" @update:open="emit('update:modelValue', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Domain</DialogTitle>
        <DialogDescription>{{ domain?.url }}</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-2">
        <div class="flex items-center gap-3">
          <Switch v-model="editNotifications" id="edit-notifications" />
          <Label for="edit-notifications">Notifications</Label>
        </div>

        <div class="flex flex-col gap-2">
          <Label class="text-sm text-muted-foreground">Notify me before expiration</Label>
          <div class="flex gap-3">
            <label
              v-for="days in THRESHOLD_OPTIONS"
              :key="days"
              class="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                :checked="editNotifyDays.includes(days)"
                @change="toggleThreshold(days)"
                class="accent-primary"
              />
              <span class="text-sm">{{ days }} days</span>
            </label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button @click="updateDomain()" class="cursor-pointer">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
