<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const { fetch: refreshSession } = useUserSession();

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { email: email.value, password: password.value },
    });
    await refreshSession();
    await navigateTo("/");
  } catch (err: any) {
    error.value = err?.data?.message || "Invalid credentials";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl"> Welcome back </CardTitle>
        <CardDescription> Sign in to your account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <FieldGroup>
            <Field>
              <FieldLabel for="email"> Email </FieldLabel>
              <Input id="email" v-model="email" type="email" placeholder="example@supadomain.com" required />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password"> Password </FieldLabel>
              </div>
              <Input id="password" v-model="password" type="password" required />
            </Field>
            <p v-if="error" class="text-sm text-destructive text-center">{{ error }}</p>
            <Field>
              <Button type="submit" :disabled="loading">
                <Spinner v-if="loading" class="mr-2 size-4" />
                Login
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center"> Supadomain helps you manage your domains efficiently. </FieldDescription>
  </div>
</template>
