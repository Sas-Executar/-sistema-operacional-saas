import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * O PDF precisa ser vetorial, não imagem.
 *
 * `print.vector_first: true` e `fonts_embedded: true` só são verificáveis
 * extraindo o texto de volta do arquivo: se a folha tivesse sido capturada como
 * screenshot, a extração devolveria vazio. Este teste é o que impede alguém de
 * "resolver" um problema de layout trocando `page.pdf()` por `page.screenshot()`.
 */

/** Dimensões da página, em pontos PostScript (1pt = 1/72"). */
const A4_LANDSCAPE_PT = { width: (297 / 25.4) * 72, height: (210 / 25.4) * 72 };

async function extractPdf(path: string) {
  // O build `legacy` é o que roda fora do navegador.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Sem worker configurado, o build legacy processa na própria thread em Node.
  const doc = await pdfjs.getDocument({ url: path, isEvalSupported: false }).promise;

  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ");
    pages.push({ text, viewport: page.getViewport({ scale: 1 }) });
  }
  return { numPages: doc.numPages, pages };
}

test("o PDF tem uma página A4 paisagem com texto selecionável", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await page.goto("/preview/SEMANA_01", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const dir = mkdtempSync(join(tmpdir(), "sprint-pdf-"));
  const pdfPath = join(dir, "SEMANA_01.pdf");
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });

  const { numPages, pages } = await extractPdf(pdfPath);

  // Uma folha é uma página. Duas significam que o conteúdo transbordou.
  expect(numPages).toBe(1);

  const { width, height } = pages[0].viewport;
  expect(Math.abs(width - A4_LANDSCAPE_PT.width)).toBeLessThan(2);
  expect(Math.abs(height - A4_LANDSCAPE_PT.height)).toBeLessThan(2);
  expect(width).toBeGreaterThan(height); // paisagem, não retrato

  const { text } = pages[0];

  // Texto real extraído do PDF: prova de que é vetorial.
  expect(text).toContain("Sprint operacional");
  expect(text).toContain("Fechar Fase Zero");
  expect(text).toContain("Publicar matriz e checkpoint de retomada");

  // As referências de procedência sobrevivem à exportação — é o que liga a
  // folha impressa de volta à evidência no Linear.
  for (const ref of ["EXE-59", "EXE-121", "EXE-131", "EXE-136"]) {
    expect(text, `referência ${ref} ausente do PDF`).toContain(ref);
  }

  // Os sete rótulos de dia, incluindo o domingo em branco.
  for (const day of ["SEG 14", "TER 15", "QUA 16", "QUI 17", "SEX 18", "SÁB 19", "DOM"]) {
    expect(text, `dia ${day} ausente do PDF`).toContain(day);
  }
});

test("o PDF embute as fontes e não vira imagem", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await page.goto("/preview/SEMANA_01", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const dir = mkdtempSync(join(tmpdir(), "sprint-pdf-"));
  const pdfPath = join(dir, "SEMANA_01.pdf");
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });

  // Lê a estrutura do próprio arquivo em vez de internals da biblioteca: um
  // PDF com fonte embutida carrega um objeto /FontFileN com o programa da
  // fonte (`print.fonts_embedded: true`).
  const bytes = readFileSync(pdfPath);
  const raw = bytes.toString("latin1");

  expect(raw.startsWith("%PDF-"), "arquivo não é um PDF").toBe(true);
  expect(/\/FontFile[23]?\b/.test(raw), "nenhum programa de fonte embutido").toBe(true);
  expect(/\/Subtype\s*\/(TrueType|Type0|Type1)/.test(raw), "nenhuma fonte declarada").toBe(true);

  // Uma folha rasterizada seria dominada por um XObject de imagem. A ausência
  // de imagem é o sinal mais direto de que o texto é vetorial.
  expect(/\/Subtype\s*\/Image/.test(raw), "a folha contém imagem rasterizada").toBe(false);

  // Sanidade de tamanho: um A4 rasterizado a 300ppi passaria de 1 MB.
  expect(bytes.byteLength).toBeLessThan(1_000_000);
});
