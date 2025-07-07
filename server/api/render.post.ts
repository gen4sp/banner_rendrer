import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer";

export default defineEventHandler(async () => {
    const configPath = resolve(process.cwd(), "bannerConfig.json");
    const data = JSON.parse(readFileSync(configPath, "utf-8"));

    const outputDir = resolve(process.cwd(), "output");
    mkdirSync(outputDir, { recursive: true });

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const results: { name: string; path: string }[] = [];

    for (const size of data.sizes) {
        const params = new URLSearchParams({
            width: String(size.width),
            height: String(size.height),
            back: data.images.back,
            main: data.images.main,
            logo1: data.images.logo1,
            logo2: data.images.logo2,
        });

        const url = `http://localhost:3000${
            data.template
        }?${params.toString()}`;

        await page.setViewport({ width: size.width, height: size.height });
        await page.goto(url, { waitUntil: "networkidle0" });

        const buffer = await page.screenshot({ type: "png" });
        const filename = `${size.name || `${size.width}x${size.height}`}.png`;
        const filepath = resolve(outputDir, filename);
        writeFileSync(filepath, buffer);

        results.push({ name: size.name ?? filename, path: filepath });
    }

    await browser.close();

    return results;
});
