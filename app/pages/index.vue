<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

useSeoMeta({
  title: "Track My Domain - Home",
});

definePageMeta({
  title: "Domains",
});

const domains = ref([
  {
    id: 1,
    domain: "example.com",
    expireTime: "2024-12-31",
    notifications: "Enabled",
  },
]);

async function removeDomain(id: number) {
  domains.value = domains.value.filter((domain) => domain.id !== id);
}
</script>

<template>
  <div class="flex flex-col p-6">
    <div class="flex justify-between mb-4">
      <h1>Manage Your Domains</h1>

      <Dialog>
        <DialogTrigger>
          <Button> Add new domain </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new Domain</DialogTitle>
            <DialogDescription>
              <Label for="domain">Domain URL</Label>

              <Input id="domain" type="text" placeholder="www.example.com" />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="submit" class="cursor-pointer">Add</Button>
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
              {{ domain.domain }}
            </TableCell>
            <TableCell>{{ domain.expireTime }}</TableCell>
            <TableCell>{{ domain.notifications }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="destructive"
                size="sm"
                @click="removeDomain(domain.id)"
                >Remove</Button
              >
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
