<template>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <UCard v-for="item in items" :key="item.path" class="flex flex-col">
            <template #header>
                <span class="font-medium text-sm">{{ item.name }}</span>
            </template>

            <img
                :src="src(item.path)"
                :alt="item.name"
                class="w-full aspect-video object-contain bg-gray-50 dark:bg-gray-800"
            />

            <template #footer>
                <UButton
                    size="xs"
                    variant="soft"
                    :to="src(item.path)"
                    target="_blank"
                >
                    Открыть
                </UButton>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
interface Item {
    name: string;
    path: string;
}

defineProps<{ items: Item[] }>();

/**
 * Возвращает абсолютный путь до изображения.
 * Если API вернул относительный путь без начального слеша,
 * метод добавит его.
 */
function src(p: string) {
    if (p.startsWith("/")) return p;
    return "/" + p;
}
</script>
