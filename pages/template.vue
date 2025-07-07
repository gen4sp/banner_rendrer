<template>
    <div
        class="banner-container"
        :style="{
            width: `${width}px`,
            height: `${height}px`,
        }"
    >
        <img class="layer" :src="back" alt="back" />
        <img class="layer" :src="main" alt="main" />
        <img class="layer" :src="logo1" alt="logo1" />
        <img class="layer" :src="logo2" alt="logo2" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const width = Number(route.query.width || 1200);
const height = Number(route.query.height || 628);
const back = String(route.query.back || "");
const main = String(route.query.main || "");
const logo1 = String(route.query.logo1 || "");
const logo2 = String(route.query.logo2 || "");
</script>

<style scoped>
.banner-container {
    position: relative;
    overflow: hidden;
}
.layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
