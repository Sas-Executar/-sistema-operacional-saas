import { spawn, type ChildProcess } from "node:child_process";
import { PROJECT_ROOT } from "./paths";

/**
 * Sobe o servidor Next de produção e espera ele responder.
 *
 * Usado pelo export de PDF e pelos testes end-to-end, para que os dois ataquem
 * a mesma rota servida do mesmo jeito.
 */

export interface RunningServer {
  baseUrl: string;
  stop: () => Promise<void>;
}

const DEFAULT_PORT = 3210;

async function waitForServer(baseUrl: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/preview/SEMANA_01`, {
        signal: AbortSignal.timeout(5_000),
      });
      // Qualquer resposta HTTP significa que o servidor está de pé; o status em
      // si é assunto do teste, não da espera.
      if (response.status > 0) return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  throw new Error(`Servidor não respondeu em ${timeoutMs}ms: ${String(lastError)}`);
}

/** Inicia `next start`. O chamador é responsável por chamar `stop()`. */
export async function startServer(port = DEFAULT_PORT): Promise<RunningServer> {
  const baseUrl = `http://127.0.0.1:${port}`;

  const child: ChildProcess = spawn(
    "npx",
    ["next", "start", "-p", String(port)],
    {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    },
  );

  const stop = async (): Promise<void> => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    child.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 5_000);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  };

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    await stop();
    throw error;
  }

  return { baseUrl, stop };
}
