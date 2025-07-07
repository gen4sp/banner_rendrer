<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-6">Banner Renderer</h1>

        <UButton color="primary" @click="startRender" :loading="loading">
            {{ loading ? "Rendering…" : "StartRender" }}
        </UButton>

        <Preview v-if="result?.length" :items="result" class="mt-8" />
    </div>
</template>

<script setup lang="ts">
const loading = ref(false);
const result = ref<{ name: string; path: string }[] | null>(null);

async function startRender() {
    loading.value = true;
    result.value = null;
    try {
        result.value = await $fetch("/api/render", { method: "POST" });
    } finally {
        loading.value = false;
    }
}
</script>
