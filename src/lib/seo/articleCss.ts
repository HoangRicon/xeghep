import { sanitizeArticleCss } from "./sanitizeScopedCss";

const STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

/**
 * Bài viết lưu HTML thô trong `content`; các khối <style> bị sanitize khỏi
 * `contentHtml` nên phải tách riêng và scope vào [data-article-content].
 */
export function extractArticleCss(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";

  const blocks: string[] = [];
  for (const match of raw.matchAll(STYLE_BLOCK_RE)) {
    if (match[1]?.trim()) blocks.push(match[1]);
  }

  return sanitizeArticleCss(blocks.join("\n"));
}
