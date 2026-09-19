import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { normalizedPath } from "./paths";
import { SprintValidationError, validateSprintDocument } from "./validators";
import type { Sprint, SprintDocument } from "./types";

/**
 * Carregamento do YAML normalizado.
 *
 * Nenhum caminho de leitura devolve um sprint que não tenha passado pelo
 * schema e pelos validadores de conteúdo. Conteúdo inválido levanta
 * `SprintValidationError` com o relatório inteiro, em vez de ser renderizado
 * pela metade — é o `failure_policy: reject_and_regenerate` na porta de entrada.
 */

/** Faz parse de YAML já em memória e valida. */
export function parseSprint(source: string): Sprint {
  const document = yaml.load(source) as unknown;
  const result = validateSprintDocument(document);

  if (!result.valid) {
    throw new SprintValidationError(
      result.schemaValid
        ? `Sprint reprovado no contrato de conteúdo: ${result.errors.length} erro(s).`
        : `Sprint reprovado no schema: ${result.schemaErrors.length} erro(s).`,
      result,
      result.schemaErrors,
    );
  }

  return (document as SprintDocument).sprint;
}

/** Lê e valida `data/<sprintId>.normalized.yaml`. */
export function loadSprint(sprintId: string): Sprint {
  const path = normalizedPath(sprintId);
  let source: string;
  try {
    source = readFileSync(path, "utf8");
  } catch {
    throw new Error(`Sprint "${sprintId}" não encontrado em ${path}`);
  }
  return parseSprint(source);
}

/**
 * Lê sem validar. Existe só para os testes poderem partir do payload real e
 * mutá-lo para provar que a validação reprova. Não use no caminho de render.
 */
export function loadSprintRaw(sprintId: string): SprintDocument {
  return yaml.load(readFileSync(normalizedPath(sprintId), "utf8")) as SprintDocument;
}
