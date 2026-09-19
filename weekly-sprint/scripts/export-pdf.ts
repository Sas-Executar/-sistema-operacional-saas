import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { OUT_DIR } from "../src/lib/paths";
import { startServer } from "../src/lib/server";
import { chromiumLaunchOptions } from "../src/lib/browser";

/**
 * Exporta o PDF a partir da MESMA rota que o navegador usa.
 *
 * `page.pdf()` sobre HTML/CSS produz texto vetorial e selecionável. Nunca
 * capture a folha como imagem: `print.vector_first: true` e o teste de
 * seletibilidade dependem disso.
 */

const sprintId = process.argv[2] ?? "SEMANA_01";

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch(chromiumLaunchOptions());

  try {
    const page = await browser.newPage();
    const url = `${server.baseUrl}/preview/${sprintId}`;

    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      throw new Error(`Rota ${url} respondeu ${response?.status()}`);
    }

    // A folha só é confiável depois que a fonte carrega: a métrica do Inter
    // decide onde as linhas quebram, e portanto a altura das colunas.
    await page.evaluate(() => document.fonts.ready);

    const sheet = page.locator(".sheet");
    if ((await sheet.count()) === 0) {
      throw new Error(
        `Nenhuma folha renderizada em ${url} — provavelmente o sprint reprovou na validação.`,
      );
    }

    const pdfPath = join(OUT_DIR, `${sprintId}.pdf`);
    await page.pdf({
      path: pdfPath,
      // O @page do CSS manda na geometria; nada de repetir o tamanho aqui.
      preferCSSPageSize: true,
      printBackground: true,
    });

    const pngPath = join(OUT_DIR, `${sprintId}.png`);
    await sheet.screenshot({ path: pngPath });

    // Artefato de inspeção a 85%, exigido por tests/ACCEPTANCE.md. Não é
    // baseline automatizado: serve para olhar se a hierarquia sobrevive à
    // redução típica de fotocopiadora.
    await page.addStyleTag({
      content: ".sheet { zoom: 0.85; }",
    });
    await page.locator(".sheet").screenshot({
      path: join(OUT_DIR, `${sprintId}.85pct.png`),
    });

    console.log(`PDF:  ${pdfPath}`);
    console.log(`PNG:  ${pngPath}`);
    console.log(`85%:  ${join(OUT_DIR, `${sprintId}.85pct.png`)}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
