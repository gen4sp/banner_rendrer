import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer";

export interface RenderSize {
    width: number;
    height: number;
    name?: string;
}

export interface RenderResult {
    name: string;
    path: string;
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
            });
        }

        await browser.close();
        return results;
    }
}
