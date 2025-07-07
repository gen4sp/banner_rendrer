import { defineEventHandler, readBody, createError } from "h3";
import { Renderer, RenderSize } from "../utils/Renderer";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const html: string | undefined = body?.html;
    const sizes: RenderSize[] | undefined = body?.sizes;

    if (!html || !Array.isArray(sizes) || sizes.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid payload: html and sizes are required",
        });
    }

    return Renderer.render(html, sizes);
});
