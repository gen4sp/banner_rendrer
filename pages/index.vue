<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-6">Banner Renderer</h1>

        <UButton color="primary" @click="startRender" :loading="loading">
            {{ loading ? "Rendering…" : "StartRender" }}
        </UButton>

        <div v-if="sizes.length" class="mt-8">
            <h2 class="text-xl font-semibold mb-4">Предпросмотр размеров</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <UCard
                    v-for="size in sizes"
                    :key="size.name"
                    :ui="{
                        slots: {
                            body: 'p-0 sm:p-0',
                        },
                    }"
                    class="flex flex-col"
                >
                    <template #header>
                        <span class="font-medium text-sm"
                            >{{ size.name }} - {{ size.width }}×{{
                                size.height
                            }}</span
                        >
                    </template>

                    <div
                        class="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800"
                        :style="{ aspectRatio: `${size.width}/${size.height}` }"
                    >
                        <HTMLPreview :html="defaultTemplate" class="" />
                    </div>
                </UCard>
            </div>
        </div>

        <HTMLPreview
            v-if="defaultTemplate"
            :html="defaultTemplate"
            class="mt-8"
        />
    </div>
</template>

<script setup lang="ts">
import HTMLPreview from "../components/HTMLPreview.vue";
// @ts-ignore
import { ref } from "vue";
// @ts-ignore
// import { useToast } from "#ui";
// @ts-ignore
import bannerConfig from "~/bannerConfig.json";
// Импортируем HTML-шаблон как сырой текст
// Vite поддерживает суффикс ?raw для загрузки содержимого файла строкой
// @ts-ignore
import defaultTemplate from "~/templates/default.html?raw";

const loading = ref(false);
const result = ref<{ name: string; path: string }[] | null>(null);
const sizes = ref<{ name: string; width: number; height: number }[]>(
    (bannerConfig as any).sizes ?? []
);

// @ts-ignore
const toast = useToast();
console.log("data", bannerConfig);
async function startRender() {
    loading.value = true;
    result.value = null;
    try {
        result.value = await $fetch("/api/render", { method: "POST" });
        toast.add({
            title: "Рендер завершён",
            icon: "i-heroicons-check-circle",
            color: "green",
        });
    } catch (e) {
        toast.add({
            title: "Ошибка рендера",
            icon: "i-heroicons-exclamation-triangle",
            color: "red",
        });
        console.error(e);
    } finally {
        loading.value = false;
    }
}
</script>
