import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Raiz do projeto `weekly-sprint/`.
 *
 * Resolvida procurando `spec/normative.yaml` a partir deste módulo e, se o
 * bundler tiver reescrito o caminho do módulo, a partir do cwd. As duas
 * tentativas cobrem os três contextos em que o código roda: tsx (scripts e
 * pipeline), vitest e o servidor do Next.
 */
function findProjectRoot(): string {
  const candidates: string[] = [];

  try {
    candidates.push(dirname(fileURLToPath(import.meta.url)));
  } catch {
    // import.meta.url indisponível sob alguns bundlers; o cwd cobre o caso.
  }
  candidates.push(process.cwd());

  for (const start of candidates) {
    let dir = resolve(start);
    // Sobe até a raiz do sistema de arquivos procurando a marca do projeto.
    for (;;) {
      if (existsSync(join(dir, "spec", "normative.yaml"))) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error(
    "Raiz do projeto não encontrada: nenhum diretório ancestral contém spec/normative.yaml",
  );
}

export const PROJECT_ROOT = findProjectRoot();

export const SPEC_DIR = join(PROJECT_ROOT, "spec");
export const DATA_DIR = join(PROJECT_ROOT, "data");
export const OUT_DIR = join(PROJECT_ROOT, "out");

export const NORMATIVE_PATH = join(SPEC_DIR, "normative.yaml");
export const SCHEMA_PATH = join(SPEC_DIR, "sprint.schema.json");

/** Caminho do YAML normalizado de um sprint, ex.: "SEMANA_01". */
export function normalizedPath(sprintId: string): string {
  return join(DATA_DIR, `${sprintId}.normalized.yaml`);
}
