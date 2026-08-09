import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

export async function extractStructuredText(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lineGroups = [];

    content.items.forEach((item) => {
      const transform = item.transform || [];
      const x = transform[4] ?? 0;
      const y = transform[5] ?? 0;
      const text = String(item.str || '').trim();
      if (!text) return;

      const existing = lineGroups.find((line) => Math.abs(line.y - y) <= 5);
      if (existing) {
        existing.items.push({ text, x });
      } else {
        lineGroups.push({ y, items: [{ text, x }] });
      }
    });

    const pageLines = lineGroups
      .sort((a, b) => b.y - a.y)
      .map((line) => ({
        y: line.y,
        items: line.items.sort((a, b) => a.x - b.x),
      }));

    pages.push(pageLines);
  }

  return pages;
}

export function plainTextToHtml(input) {
  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  if (!input) return '';
  const str = String(input);
  // If it already contains HTML tags, return as-is (idempotent)
  if (/<[a-z][\s\S]*>/i.test(str)) return str;

  const lines = str.split(/\r?\n/);
  const parts = [];

  for (const raw of lines) {
    const line = String(raw || '').trim();
    if (!line) {
      parts.push('<br/>');
      continue;
    }

    // Short ALL CAPS lines -> heading-like
    if (line.length < 60 && line === line.toUpperCase()) {
      parts.push(`<h4 style="font-size:13px;font-weight:700;color:#1a2b4b;margin-top:12px;">${escapeHtml(line)}</h4>`);
      continue;
    }

    // Bulleted lines
    if (/^[•\-]\s*/.test(line)) {
      const content = line.replace(/^[•\-]\s*/, '');
      parts.push(`<p style="position:relative;padding-left:20px;margin-bottom:4px;font-size:13px;color:#4b5563;line-height:1.6;"><span style="position:absolute;left:0;top:0;color:#4b5563;">•</span>${escapeHtml(content)}</p>`);
      continue;
    }

    // Default paragraph
    parts.push(`<p style="font-size:13px;color:#4b5563;line-height:1.6;margin-bottom:8px;">${escapeHtml(line)}</p>`);
  }

  return parts.join('');
}

// Terms content is stored as simple HTML produced by plainTextToHtml. Keeping
// elements intact while splitting prevents headings and paragraphs from being
// cut in the middle when a template needs an additional A4 sheet.
export function parseHtmlElements(html) {
  if (!html) return [];
  const tagPattern = /(<h4[^>]*>.*?<\/h4>|<p[^>]*>.*?<\/p>|<br\s*\/?>)/gis;
  return [...String(html).matchAll(tagPattern)].map((match) => match[0]);
}

export function estimateElementHeight(element) {
  if (/^<br\s*\/?>$/i.test(element.trim())) return 8;
  if (/^<h4\b/i.test(element)) return 32;

  const text = element.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim();
  const lines = Math.max(1, Math.ceil(text.length / 90));
  return Math.max(25, (lines * 19) + 6);
}

export function chunkHtmlElements(html, usableHeight = 887) {
  const elements = parseHtmlElements(html);
  if (!elements.length) return [];

  const chunks = [];
  let currentChunk = [];
  let currentHeight = 0;

  elements.forEach((element) => {
    const height = estimateElementHeight(element);
    if (currentChunk.length && currentHeight + height > usableHeight) {
      chunks.push(currentChunk);
      currentChunk = [element];
      currentHeight = height;
    } else {
      currentChunk.push(element);
      currentHeight += height;
    }
  });

  if (currentChunk.length) chunks.push(currentChunk);
  return chunks;
}
