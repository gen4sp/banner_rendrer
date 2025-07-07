import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
    modules: ["@nuxthq/ui"],
    ui: {
        /* Опции UI можно настроить при необходимости */
    },
    nitro: {
        preset: "node",
    },
});
