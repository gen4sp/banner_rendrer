<template>
    <!-- Обёртка нужна, чтобы отслеживать её размеры и масштабировать iframe -->
    <div ref="wrapper" class="w-full h-full overflow-hidden">
        <iframe
            ref="iframeEl"
            class="border-none pointer-events-none"
            :srcdoc="html"
            sandbox="allow-scripts allow-same-origin"
            :style="iframeStyles"
        ></iframe>
    </div>
</template>

<script setup lang="ts">
/**
 * Компонент, который принимает HTML-строку и отображает её во всю
 * ширину и высоту контейнера при помощи атрибута srcdoc у iframe.
 * Если переданы width/height, то содержимое масштабируется так,
 * чтобы поместиться в контейнер, сохраняя пропорции.
 */

import { ref, onMounted, onUnmounted, watch, computed } from "vue";

const props = defineProps<{
    html: string;
    width?: number; // исходная ширина баннера (px)
    height?: number; // исходная высота баннера (px)
}>();

const wrapper = ref<HTMLElement | null>(null);
const iframeEl = ref<HTMLIFrameElement | null>(null);
const scale = ref(1);

function updateScale() {
    if (!wrapper.value || !props.width || !props.height) {
        scale.value = 1;
        return;
    }
    // вычисляем коэффициент масштабирования, берём минимальный
    const { clientWidth, clientHeight } = wrapper.value;
    const scaleX = clientWidth / props.width;
    const scaleY = clientHeight / props.height;
    scale.value = Math.min(scaleX, scaleY);
}

let observer: ResizeObserver | null = null;

onMounted(() => {
    updateScale();
    if (wrapper.value) {
        observer = new ResizeObserver(updateScale);
        observer.observe(wrapper.value);
    }
});

onUnmounted(() => {
    if (observer && wrapper.value) {
        observer.unobserve(wrapper.value);
    }
});

// если изменятся пропсы, пересчитываем масштаб
watch(() => [props.width, props.height], updateScale);

// вычисляем inline-style для iframe
const iframeStyles = computed(() => {
    const base: Record<string, string> = {
        transformOrigin: "top left",
    };

    // если указана ширина/высота, задаём их явным образом,
    // иначе растягиваем на всю обёртку
    if (props.width && props.height) {
        base.width = `${props.width}px`;
        base.height = `${props.height}px`;
    } else {
        base.width = "100%";
        base.height = "100%";
    }

    // применяем масштаб
    base.transform = `scale(${scale.value})`;

    return base;
});
</script>
