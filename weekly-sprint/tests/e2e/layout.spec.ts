import { expect, test } from "@playwright/test";

/**
 * Gate de estouro.
 *
 * O contrato proíbe encolher (`overflow.font_shrink: false`) e truncar
 * (`overflow.truncate: false`). Sem um gate, a única saída de conteúdo grande
 * demais seria vazar por cima do resto — que é um defeito silencioso numa folha
 * impressa. Este teste torna o vazamento uma falha de build.
 *
 * Mede três coisas:
 * 1. a folha cabe em uma página A4 paisagem;
 * 2. nenhum bloco de texto estoura sua coluna na horizontal;
 * 3. nenhum texto foi renderizado abaixo de `typography.min_text_pt`.
 */

const MM_PER_PX = 25.4 / 96;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ media: "print" });
});

async function gotoSheet(page: import("@playwright/test").Page, sprintId = "SEMANA_01") {
  const response = await page.goto(`/preview/${sprintId}`, { waitUntil: "networkidle" });
  expect(response?.ok(), `rota /preview/${sprintId} respondeu ${response?.status()}`).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".sheet")).toHaveCount(1);
}

test("a folha ocupa exatamente uma página A4 paisagem", async ({ page }) => {
  await gotoSheet(page);

  const box = await page.locator(".sheet").boundingBox();
  expect(box).not.toBeNull();

  const widthMm = box!.width * MM_PER_PX;
  const heightMm = box!.height * MM_PER_PX;

  // Tolerância de 0,5mm cobre arredondamento de px do navegador.
  expect(Math.abs(widthMm - 297)).toBeLessThan(0.5);
  expect(Math.abs(heightMm - 210)).toBeLessThan(0.5);
});

test("nenhum conteúdo estoura a folha na vertical", async ({ page }) => {
  await gotoSheet(page);

  const overflow = await page.evaluate(() => {
    const sheet = document.querySelector(".sheet") as HTMLElement;
    const sheetBottom = sheet.getBoundingClientRect().bottom;
    const padding = parseFloat(getComputedStyle(sheet).paddingBottom);
    const limit = sheetBottom - padding;

    const offenders: { selector: string; overflowPx: number; text: string }[] = [];
    for (const element of Array.from(sheet.querySelectorAll<HTMLElement>("*"))) {
      if (!element.textContent?.trim()) continue;
      const bottom = element.getBoundingClientRect().bottom;
      if (bottom > limit + 1) {
        offenders.push({
          selector: element.className || element.tagName,
          overflowPx: Math.round(bottom - limit),
          text: element.textContent.trim().slice(0, 60),
        });
      }
    }
    return offenders;
  });

  expect(
    overflow,
    `Conteúdo abaixo da margem inferior — o contrato proíbe encolher para caber:\n${JSON.stringify(overflow, null, 2)}`,
  ).toEqual([]);
});

test("as faixas da folha não se sobrepõem", async ({ page }) => {
  await gotoSheet(page);

  // A faixa de dias não pode invadir o rodapé. É o sintoma que aparece primeiro
  // quando o orçamento vertical estoura.
  const gap = await page.evaluate(() => {
    const days = document.querySelector(".days")!.getBoundingClientRect();
    const footer = document.querySelector(".footer")!.getBoundingClientRect();
    return footer.top - days.bottom;
  });

  expect(gap, "a faixa de dias invadiu o rodapé").toBeGreaterThanOrEqual(-1);
});

test("nenhum texto estoura a coluna na horizontal", async ({ page }) => {
  await gotoSheet(page);

  const offenders = await page.evaluate(() => {
    const found: { selector: string; text: string; overflowPx: number }[] = [];
    const selectors = [
      ".day__objective",
      ".action__text",
      ".action__ref",
      ".deliverable",
      ".day__note",
      ".priority",
      ".risk",
    ];
    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
        // scrollWidth > clientWidth significa que o conteúdo não coube na caixa.
        if (element.scrollWidth > element.clientWidth + 1) {
          found.push({
            selector,
            text: element.textContent?.trim().slice(0, 50) ?? "",
            overflowPx: element.scrollWidth - element.clientWidth,
          });
        }
      }
    }
    return found;
  });

  expect(
    offenders,
    `Texto mais largo que a coluna:\n${JSON.stringify(offenders, null, 2)}`,
  ).toEqual([]);
});

test("nenhum texto fica abaixo do tamanho mínimo do contrato", async ({ page }) => {
  await gotoSheet(page);

  const tooSmall = await page.evaluate(() => {
    const sheet = document.querySelector(".sheet") as HTMLElement;
    const minPt = parseFloat(getComputedStyle(sheet).getPropertyValue("--min-text"));
    const minPx = (minPt / 72) * 96;

    const found: { selector: string; sizePx: number; text: string }[] = [];
    for (const element of Array.from(sheet.querySelectorAll<HTMLElement>("*"))) {
      const text = element.textContent?.trim();
      if (!text || element.children.length > 0) continue;
      const sizePx = parseFloat(getComputedStyle(element).fontSize);
      if (sizePx < minPx - 0.5) {
        found.push({ selector: element.className || element.tagName, sizePx, text: text.slice(0, 40) });
      }
    }
    return found;
  });

  expect(
    tooSmall,
    `Texto abaixo de min_text_pt — indício de encolhimento proibido:\n${JSON.stringify(tooSmall, null, 2)}`,
  ).toEqual([]);
});

test("a grade tem sempre sete colunas, com o domingo em branco na SEMANA_01", async ({ page }) => {
  await gotoSheet(page);

  await expect(page.locator(".day")).toHaveCount(7);
  await expect(page.locator('.day[data-filled="true"]')).toHaveCount(6);

  const sunday = page.locator('.day[data-slot="DOM"]');
  await expect(sunday).toHaveAttribute("data-filled", "false");
  // A coluna vazia não inventa conteúdo: só o rótulo do dia.
  await expect(sunday.locator(".actions")).toHaveCount(0);
});

test("as colunas têm a mesma largura", async ({ page }) => {
  await gotoSheet(page);

  const widths = await page.locator(".day").evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  );

  expect(widths).toHaveLength(7);
  const spread = Math.max(...widths) - Math.min(...widths);
  expect(spread, "colunas com larguras diferentes").toBeLessThan(1);
});
