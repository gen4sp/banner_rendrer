import { describe, it, expect, afterAll } from "vitest";
import { Renderer } from "../server/utils/Renderer";
import { readFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Путь к шаблону default.html
const templatePath = resolve(__dirname, "../templates/default.html");

// Каталог, куда будем выводить изображения во время теста
const outputDir = resolve(__dirname, "output");

describe("Renderer.render", () => {
    afterAll(() => {
        // Удаляем каталог с результатами после выполнения тестов
        rmSync(outputDir, { recursive: true, force: true });
    });

    it("рендерит default.html без ошибок", async () => {
        const html = readFileSync(templatePath, "utf8");

        const sizes = [{ width: 1200, height: 630, name: "banner-test" }];

        const results = await Renderer.render(html, sizes, outputDir);

        // Ожидаем один результат
        expect(results).toHaveLength(1);

        const expectedFile = resolve(outputDir, "banner-test.png");

        // Проверяем, что файл создан
        expect(existsSync(expectedFile)).toBe(true);

        // Проверяем, что путь в результате корректный
        expect(results[0]).toStrictEqual({
            name: "banner-test",
            path: "/output/banner-test.png",
            filePath: expectedFile,
        });
    }, 20000); // даём достаточно времени

    it("создает архив с изображениями", async () => {
        const html = readFileSync(templatePath, "utf8");

        const sizes = [
            { width: 1200, height: 630, name: "facebook" },
            { width: 1080, height: 1080, name: "instagram" },
        ];

        const results = await Renderer.render(html, sizes, outputDir);

        // Создаем архив
        const archiveBuffer = await Renderer.createArchive(
            results,
            "test-banners"
        );

        // Проверяем, что архив создан и не пустой
        expect(archiveBuffer).toBeInstanceOf(Buffer);
        expect(archiveBuffer.length).toBeGreaterThan(0);

        // Проверяем, что это валидный zip-файл (начинается с PK)
        expect(archiveBuffer.slice(0, 2).toString()).toBe("PK");
    }, 20000);
});
