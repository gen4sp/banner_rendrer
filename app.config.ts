// @ts-nocheck

export default defineAppConfig({
    ui: {
        card: {
            slots: {
                // Убираем паддинги у всех слотов Card
                // header: "p-0",
                body: "p-0 sm:p-0",
                footer: "p-0",
            },
        },
    },
});
