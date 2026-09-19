import { defineConfig } from "@playwright/test";
import { chromiumLaunchOptions } from "./src/lib/browser";

/**
 * O servidor é de produção (`next build` + `next start`), não `next dev`: o
 * PDF e o gate de estouro precisam medir o mesmo CSS que vai para a impressora.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 90_000,
  use: {
    baseURL: "http://127.0.0.1:3210",
    // Usa o Chromium já presente no ambiente em vez de baixar outro build.
    launchOptions: chromiumLaunchOptions(),
  },
  webServer: {
    command: "npx next start -p 3210",
    url: "http://127.0.0.1:3210/preview/SEMANA_01",
    // Nunca reaproveitar um servidor já de pé. Um `next start` órfão continua
    // servindo um build anterior cujo CSS já foi substituído em disco: a página
    // carrega sem estilo e o gate mede a folha errada. Subir sempre um servidor
    // novo custa alguns segundos e elimina a classe inteira de erro.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
