import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
    modules: ["@nuxt/ui"],
    css: ["~/assets/css/main.css"],
    nitro: {
        preset: "node",
    },
});
