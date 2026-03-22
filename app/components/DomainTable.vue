<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Trash, Pencil } from "lucide-vue-next";
import type { Domain } from "../types/domain.interface";

defineProps<{
  domains: Domain[];
}>();

const emit = defineEmits<{
  edit: [domain: Domain];
  remove: [url: string];
}>();
</script>

<template>
  <Table>
    <TableCaption>Total {{ domains.length }} domains listed</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Domain</TableHead>
        <TableHead>Expire Time</TableHead>
        <TableHead>Notifications</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="domain in domains" :key="domain.id">
        <TableCell class="font-medium">{{ domain.url }}</TableCell>
        <TableCell>
          {{ domain.expireTime ? new Date(domain.expireTime).toLocaleDateString() : "N/A" }}
        </TableCell>
        <TableCell>
          <Badge :variant="domain.notifications ? 'default' : 'destructive'">
            {{ domain.notifications ? "Enabled" : "Disabled" }}
          </Badge>
        </TableCell>
        <TableCell class="text-right flex justify-end gap-2">
          <Button class="cursor-pointer" variant="secondary" size="icon" @click="emit('edit', domain)">
            <Pencil class="size-4" />
          </Button>
          <Button class="cursor-pointer" variant="secondary" size="icon" @click="emit('remove', domain.url)">
            <Trash class="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
