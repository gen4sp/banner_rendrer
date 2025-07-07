<template>
    <iframe
        class="w-full h-full border-none"
        :srcdoc="html"
        sandbox="allow-scripts allow-same-origin"
    ></iframe>
</template>

<script setup lang="ts">
/**
 * Компонент, который принимает HTML-строку и отображает её во всю
 * ширину и высоту контейнера при помощи атрибута srcdoc у iframe.
 */

defineProps<{ html: string }>();
</script>
