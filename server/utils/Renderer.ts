import { mkdirSync, writeFileSync, createReadStream } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer";
import archiver from "archiver";
import type { Archiver } from "archiver";

export interface RenderSize {
    width: number;
    height: number;
    name?: string;
}

export interface RenderResult {
    name: string;
    path: string;
    filePath: string;
}

export class Renderer {
    /**
     * Рендерит HTML-контент в изображения заданных размеров.
     *
     * @param html      HTML-текст для рендера.
     * @param sizes     Массив объектов с шириной, высотой и необязательным именем.
     * @param outputDir Каталог, куда сохранять изображения. По умолчанию public/output.
     */
    static async render(
        html: string,
        sizes: RenderSize[],
        outputDir: string = resolve(process.cwd(), "public", "output")
    ): Promise<RenderResult[]> {
        mkdirSync(outputDir, { recursive: true });

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        const results: RenderResult[] = [];

        for (const size of sizes) {
            await page.setViewport({ width: size.width, height: size.height });
            await page.setContent(html, { waitUntil: "networkidle0" });

            const buffer = await page.screenshot({ type: "png" });
            const filename = `${
                size.name || `${size.width}x${size.height}`
            }.png`;
            const filepath = resolve(outputDir, filename);
            writeFileSync(filepath, buffer);

            results.push({
                name: size.name ?? filename,
                path: `/output/${filename}`,
                filePath: filepath,
            });
        }

        await browser.close();
        return results;
    }

    /**
     * Создает zip-архив с отрендеренными изображениями.
     *
     * @param results Результаты рендеринга изображений
     * @param archiveName Имя архива (без расширения)
     * @returns Promise<Buffer> Буфер с zip-архивом
     */
    static async createArchive(
        results: RenderResult[],
        archiveName: string = "banners"
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const archive = archiver("zip", {
                zlib: { level: 9 }, // Максимальное сжатие
            });

            const chunks: Buffer[] = [];

            archive.on("data", (chunk) => {
                chunks.push(chunk);
            });

            archive.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            archive.on("error", (err) => {
                reject(err);
            });

            // Добавляем файлы в архив
            for (const result of results) {
                archive.file(result.filePath, { name: result.name + ".png" });
            }

            archive.finalize();
        });
    }
}
