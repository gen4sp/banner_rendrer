import { defineEventHandler, readBody, createError, setHeader } from "h3";
import { Renderer, RenderSize } from "../utils/Renderer";
import bannerConfig from "../../bannerConfig.json";
const sizes = bannerConfig.sizes;

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const html: string | undefined = body?.html;
    // const sizes: RenderSize[] | undefined = body?.sizes;
    const downloadArchive: boolean = body?.downloadArchive ?? false;

    if (!html || !Array.isArray(sizes) || sizes.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid payload: html and sizes are required",
        });
    }

    // Рендерим изображения
    const results = await Renderer.render(html, sizes);

    // Если клиент хочет скачать архив
    if (downloadArchive) {
        const archiveBuffer = await Renderer.createArchive(results, "banners");

        // Устанавливаем заголовки для скачивания файла
        setHeader(event, "Content-Type", "application/zip");
        setHeader(
            event,
            "Content-Disposition",
            "attachment; filename=banners.zip"
        );
        setHeader(event, "Content-Length", archiveBuffer.length);

        return archiveBuffer;
    }

    // Возвращаем обычный ответ с путями к файлам
    return results;
});
