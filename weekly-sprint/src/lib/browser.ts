import { existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Localiza o Chromium a usar.
 *
 * Em ambientes com Chromium pré-instalado (`PLAYWRIGHT_BROWSERS_PATH`), a
 * versão do pacote `@playwright/test` pode não bater com o build baixado. Em vez
 * de forçar um download — que pode estar bloqueado e desperdiça banda —, este
 * módulo encontra o executável já presente.
 *
 * Devolve `undefined` quando não há nada pré-instalado, deixando o Playwright
 * usar o navegador que ele próprio gerencia.
 */
export function findChromiumExecutable(): string | undefined {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!browsersPath || !existsSync(browsersPath)) return undefined;

  // Caminhos relativos possíveis dentro de cada diretório de build.
  const relativeCandidates = [
    join("chrome-linux", "chrome"),
    join("chrome-linux", "headless_shell"),
    join("chrome-headless-shell-linux64", "chrome-headless-shell"),
  ];

  let entries: string[];
  try {
    entries = readdirSync(browsersPath);
  } catch {
    return undefined;
  }

  // Prefere o Chromium completo ao headless shell: o shell não imprime PDF.
  const ordered = entries
    .filter((entry) => entry.startsWith("chromium"))
    .sort((a, b) => {
      const aShell = a.includes("headless_shell") ? 1 : 0;
      const bShell = b.includes("headless_shell") ? 1 : 0;
      return aShell - bShell || b.localeCompare(a);
    });

  for (const entry of ordered) {
    for (const relative of relativeCandidates) {
      const candidate = join(browsersPath, entry, relative);
      if (existsSync(candidate)) return candidate;
    }
  }

  return undefined;
}

/** Opções de launch com o executável resolvido, quando houver um. */
export function chromiumLaunchOptions(): { executablePath?: string } {
  const executablePath = findChromiumExecutable();
  return executablePath ? { executablePath } : {};
}
