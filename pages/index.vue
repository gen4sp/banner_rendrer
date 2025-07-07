<template>
    <div class="p-8 space-y-6 max-w-xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Vantage Banner Renderer</h1>

        <!-- Выбор шаблона -->

        <div class="mb-6">
            <USelect
                v-model="selectedTemplateFile"
                :items="templateOptions"
                placeholder="Выберите шаблон"
            />
        </div>

        <div class="flex gap-4 mb-6">
            <!-- <UButton color="primary" @click="startRender" :loading="loading">
                {{ loading ? "Rendering…" : "StartRender" }}
            </UButton> -->

            <UButton
                color="primary"
                block
                @click="downloadArchive"
                :loading="archiveLoading"
            >
                {{ archiveLoading ? "Rendering..." : "Start render" }}
            </UButton>

            <UButton
                color="gray"
                variant="outline"
                @click="openTemplateInNewWindow"
                :disabled="!templateContent"
            >
                Открыть шаблон в новом окне
            </UButton>
        </div>

        <!-- Категории: горизонталь, вертикаль, квадрат -->
        <div class="mt-8">
            <div v-for="cat in categories" :key="cat.id" class="w-full">
                <UCard
                    :ui="{ slots: { body: 'p-0 sm:p-0' } }"
                    class="flex flex-col"
                >
                    <template #header>
                        <div class="flex items-center justify-between gap-4">
                            <span class="font-medium text-sm">{{
                                cat.label
                            }}</span>
                            <USelect
                                v-model="selectedSizes[cat.id]"
                                :items="cat.sizeOptions"
                            />
                        </div>
                    </template>

                    <div
                        v-if="selectedSizes[cat.id]"
                        class="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800"
                        :style="{
                            aspectRatio: `${(selectedSizes[cat.id] as any).width}/${(selectedSizes[cat.id] as any).height}`,
                        }"
                    >
                        <HTMLPreview
                            :html="templateContent"
                            :width="(selectedSizes[cat.id] as any).width"
                            :height="(selectedSizes[cat.id] as any).height"
                        />
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import HTMLPreview from "../components/HTMLPreview.vue";
import { ref, reactive, computed, watch, onMounted } from "vue";
// @ts-ignore
// import { useToast } from "#ui";
// @ts-ignore
import bannerConfig from "~/bannerConfig.json";

type Size = { name: string; width: number; height: number };

// Состояние загрузки
const loading = ref(false);
const archiveLoading = ref(false);

// Результаты рендера
const result = ref<{ name: string; path: string }[] | null>(null);

// Полный список размеров из конфигурации
const allSizes = ref<Size[]>((bannerConfig as any).sizes ?? []);

// Категоризация размеров
const categories = computed(() => {
    const horizontal = allSizes.value.filter((s) => s.width > s.height);
    const vertical = allSizes.value.filter((s) => s.width < s.height);
    const square = allSizes.value.filter((s) => s.width === s.height);

    const makeOptions = (arr: Size[]) =>
        arr.map((s) => ({
            label: `${s.name} - ${s.width}×${s.height}`,
            value: s,
        }));

    return [
        {
            id: "horizontal",
            label: "Горизонталь",
            sizes: horizontal,
            sizeOptions: makeOptions(horizontal),
        },
        {
            id: "vertical",
            label: "Вертикаль",
            sizes: vertical,
            sizeOptions: makeOptions(vertical),
        },
        {
            id: "square",
            label: "Квадрат",
            sizes: square,
            sizeOptions: makeOptions(square),
        },
    ];
});

// Выбранные размеры по категориям
const selectedSizes = reactive<Record<string, Size | null>>({});

// Шаблоны
const templates = ref<{ name: string; file: string }[]>(
    (bannerConfig as any).templates ?? []
);

// Опции для UI выбора шаблона
const templateOptions = computed(() =>
    templates.value.map((t) => ({ label: t.name, value: t.file }))
);

// Текущий выбранный файл шаблона
const selectedTemplateFile = ref<string>("");

// Содержимое выбранного шаблона (HTML)
const templateContent = ref<string>("");

// Загружаем шаблоны через import.meta.glob
// as: 'raw' заставляет Vite вернуть содержимое файла строкой
// @ts-ignore
const templateLoaders = import.meta.glob("~/templates/*.html", { as: "raw" });

async function loadTemplate(file: string) {
    for (const path in templateLoaders) {
        if (path.endsWith(`/${file}`)) {
            // @ts-ignore
            templateContent.value = await templateLoaders[path]();
            break;
        }
    }
}

// Загружаем шаблон при изменении выбора
watch(
    selectedTemplateFile,
    (file) => {
        if (file) loadTemplate(file);
    },
    { immediate: true }
);

// Следим за изменениями в templateOptions и обновляем selectedTemplateFile
watch(
    templateOptions,
    (options) => {
        if (options.length > 0 && !selectedTemplateFile.value) {
            selectedTemplateFile.value = options[0].value;
        }
    },
    { immediate: true }
);

// Инициализируем выбранные размеры при монтировании
onMounted(() => {
    // Инициализируем выбранный шаблон
    if (templateOptions.value.length > 0) {
        selectedTemplateFile.value = templateOptions.value[0].value;
    }

    categories.value.forEach((cat) => {
        if (cat.sizes.length) {
            selectedSizes[cat.id] = cat.sizes[0];
        } else {
            selectedSizes[cat.id] = null;
        }
    });
});

// @ts-ignore
const toast = useToast();
console.log("data", bannerConfig);
console.log("templates", templates.value);
console.log("templateOptions", templateOptions.value);

async function startRender() {
    loading.value = true;
    result.value = null;
    try {
        // Отправляем HTML-шаблон и размеры на серверный эндпоинт
        const sizesForRender = Object.values(selectedSizes).filter(Boolean);
        result.value = await $fetch("/api/render", {
            method: "POST",
            body: {
                html: templateContent.value,
                sizes: sizesForRender,
            },
        });

        // Логируем результат в консоль для отладки
        console.log("Render result:", result.value);

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

async function downloadArchive() {
    archiveLoading.value = true;
    try {
        const sizesForRender = Object.values(selectedSizes).filter(Boolean);

        // Отправляем запрос с флагом downloadArchive
        const response = await $fetch("/api/render", {
            method: "POST",
            body: {
                html: templateContent.value,
                sizes: sizesForRender,
                downloadArchive: true,
            },
            responseType: "blob", // Получаем blob для скачивания
        });

        // Создаем ссылку для скачивания
        const blob = new Blob([response as any], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "banners.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.add({
            title: "Архив скачан",
            icon: "i-heroicons-arrow-down-tray",
            color: "green",
        });
    } catch (e) {
        toast.add({
            title: "Ошибка создания архива",
            icon: "i-heroicons-exclamation-triangle",
            color: "red",
        });
        console.error(e);
    } finally {
        archiveLoading.value = false;
    }
}

function openTemplateInNewWindow() {
    if (!templateContent.value) {
        toast.add({
            title: "Шаблон не загружен",
            icon: "i-heroicons-exclamation-triangle",
            color: "red",
        });
        return;
    }

    // Создаем новое окно с HTML-шаблоном
    const newWindow = window.open(
        "",
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
    );

    if (newWindow) {
        newWindow.document.write(templateContent.value);
        newWindow.document.close();
        newWindow.focus();
    } else {
        toast.add({
            title: "Не удалось открыть новое окно",
            description:
                "Возможно, блокировщик всплывающих окон заблокировал открытие",
            icon: "i-heroicons-exclamation-triangle",
            color: "red",
        });
    }
}
</script>
