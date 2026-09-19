import { countWords } from "./words";
import { loadSpec, type NormativeSpec } from "./spec";
import { validateSchema } from "./schema";
import { buildCalendar } from "./calendar";
import type { Sprint, SprintDocument } from "./types";

/**
 * Validadores explícitos do contrato de conteúdo.
 *
 * O JSON Schema cobre estrutura (campos presentes, 3 ações, 1–3 entregas). Ele
 * não conta palavras, e vários campos do contrato — `review`, `next_week` — são
 * `type: object` livre no schema. É aqui que os limites do `normative.yaml`
 * viram verificação.
 *
 * Dois níveis, conforme o spec distingue:
 * - `max_words` → **erro**. Reprova o payload.
 * - `preferred_words` → **aviso**. Registrado, não bloqueia.
 *
 * Nada é truncado em nenhum dos dois casos (`overflow.truncate: false`).
 */

export type IssueSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: IssueSeverity;
  /** Caminho do campo, ex.: "sprint.days[2].actions[1].text". */
  path: string;
  rule: string;
  message: string;
  value?: string;
  count?: number;
  limit?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

class IssueCollector {
  readonly issues: ValidationIssue[] = [];

  add(issue: ValidationIssue): void {
    this.issues.push(issue);
  }

  /**
   * Aplica limite máximo (erro) e preferencial (aviso) a um texto.
   * Campos ausentes ou vazios são ignorados: presença é assunto do schema.
   */
  words(
    path: string,
    rule: string,
    text: string | undefined,
    limits: { max_words?: number; preferred_words?: number },
  ): void {
    if (text === undefined || text === null || text === "") return;
    const count = countWords(text);

    if (limits.max_words !== undefined && count > limits.max_words) {
      this.add({
        severity: "error",
        path,
        rule,
        message: `${count} palavras excede o máximo de ${limits.max_words}`,
        value: text,
        count,
        limit: limits.max_words,
      });
      return;
    }

    if (limits.preferred_words !== undefined && count > limits.preferred_words) {
      this.add({
        severity: "warning",
        path,
        rule,
        message: `${count} palavras acima do preferencial de ${limits.preferred_words}`,
        value: text,
        count,
        limit: limits.preferred_words,
      });
    }
  }

  error(path: string, rule: string, message: string, extra: Partial<ValidationIssue> = {}): void {
    this.add({ severity: "error", path, rule, message, ...extra });
  }
}

/** Valida o contrato de conteúdo de um sprint já estruturalmente válido. */
export function validateContent(
  sprint: Sprint,
  spec: NormativeSpec = loadSpec(),
): ValidationResult {
  const c = new IssueCollector();
  const contract = spec.content_contract;

  c.words("sprint.week_goal", "week_goal", sprint.week_goal, contract.week_goal);

  sprint.days.forEach((day, dayIndex) => {
    const base = `sprint.days[${dayIndex}]`;

    c.words(`${base}.objective`, "objective", day.objective, contract.objective);
    c.words(`${base}.note`, "note", day.note, contract.note);

    // Exatamente N ações por dia. O schema já exige 3; repetimos aqui porque o
    // número vem do contrato e pode mudar lá sem tocar no schema.
    if (day.actions.length !== contract.actions.count) {
      c.error(
        `${base}.actions`,
        "actions.count",
        `${day.actions.length} ações, esperado exatamente ${contract.actions.count}`,
        { count: day.actions.length, limit: contract.actions.count },
      );
    }

    day.actions.forEach((action, actionIndex) => {
      const path = `${base}.actions[${actionIndex}]`;
      c.words(`${path}.text`, "actions", action.text, contract.actions);

      // provenance_required: toda ação carrega referência de origem.
      if (!action.ref || action.ref.trim() === "") {
        c.error(`${path}.ref`, "provenance_required", "ação sem referência de origem", {
          value: action.text,
        });
      }
    });

    const { min_items, max_items } = contract.deliverables;
    if (day.deliverables.length < min_items || day.deliverables.length > max_items) {
      c.error(
        `${base}.deliverables`,
        "deliverables.items",
        `${day.deliverables.length} entregas fora da faixa ${min_items}–${max_items}`,
        { count: day.deliverables.length },
      );
    }

    day.deliverables.forEach((deliverable, i) => {
      c.words(
        `${base}.deliverables[${i}].text`,
        "deliverables",
        deliverable.text,
        contract.deliverables,
      );
    });
  });

  validateReview(sprint, contract, c);
  validateNextWeek(sprint, contract, c);
  validateCompliance(sprint, contract, c);
  validateCalendar(sprint, c);

  const errors = c.issues.filter((i) => i.severity === "error");
  const warnings = c.issues.filter((i) => i.severity === "warning");
  return { valid: errors.length === 0, errors, warnings };
}

function validateReview(
  sprint: Sprint,
  contract: NormativeSpec["content_contract"],
  c: IssueCollector,
): void {
  const limits = { max_words: contract.review.max_words_per_field };
  const review = sprint.review ?? {};

  // `mode` é enumeração, não prosa: validado contra a lista, não por palavras.
  if (review.mode && !contract.review.modes.includes(review.mode)) {
    c.error(
      "sprint.review.mode",
      "review.modes",
      `modo "${review.mode}" fora de [${contract.review.modes.join(", ")}]`,
      { value: review.mode },
    );
  }

  c.words("sprint.review.progress", "review", review.progress, limits);
  c.words("sprint.review.carryover", "review", review.carryover, limits);
  c.words("sprint.review.scheduled_for", "review", review.scheduled_for, limits);
}

function validateNextWeek(
  sprint: Sprint,
  contract: NormativeSpec["content_contract"],
  c: IssueCollector,
): void {
  const nextWeek = sprint.next_week;
  const expected = contract.next_week.priorities;
  const priorities = nextWeek?.priorities ?? [];

  if (priorities.length !== expected) {
    c.error(
      "sprint.next_week.priorities",
      "next_week.priorities",
      `${priorities.length} prioridades, esperado exatamente ${expected}`,
      { count: priorities.length, limit: expected },
    );
  }

  const limits = { max_words: contract.next_week.max_words_each };
  priorities.forEach((priority, i) => {
    c.words(`sprint.next_week.priorities[${i}].text`, "next_week", priority.text, limits);
  });

  // Extensões declaradas: `label` e `risks` não constavam do contrato 1.1.0.
  // O limite por analogia está escrito no normative.yaml (declared_extension),
  // então a regra é lida de lá, não presumida aqui.
  const labelLimit = contract.next_week.label;
  if (labelLimit?.max_words !== undefined) {
    c.words("sprint.next_week.label", "next_week.label (extensão)", nextWeek?.label, labelLimit);
  }

  const risksLimit = contract.next_week.risks;
  if (risksLimit?.max_words_each !== undefined) {
    (nextWeek?.risks ?? []).forEach((risk, i) => {
      c.words(`sprint.next_week.risks[${i}].text`, "next_week.risks (extensão)", risk.text, {
        max_words: risksLimit.max_words_each,
      });
    });
  }
}

function validateCompliance(
  sprint: Sprint,
  contract: NormativeSpec["content_contract"],
  c: IssueCollector,
): void {
  const limit = contract.compliance?.exceptions?.max_words_each;
  if (limit === undefined) return;

  (sprint.compliance?.exceptions ?? []).forEach((exception, i) => {
    c.words(
      `sprint.compliance.exceptions[${i}].text`,
      "compliance.exceptions (extensão)",
      exception.text,
      { max_words: limit },
    );
  });
}

/**
 * Os dias precisam caber na moldura de calendário. `buildCalendar` lança em
 * rótulo desconhecido ou colisão de coluna; aqui isso vira erro de validação em
 * vez de exceção, para entrar no mesmo relatório dos demais.
 */
function validateCalendar(sprint: Sprint, c: IssueCollector): void {
  try {
    buildCalendar(sprint.days);
  } catch (error) {
    c.error("sprint.days", "calendar", (error as Error).message);
  }
}

/** Erro lançado quando um payload reprova. Carrega o relatório completo. */
export class SprintValidationError extends Error {
  constructor(
    message: string,
    readonly result: ValidationResult,
    readonly schemaErrors: string[] = [],
  ) {
    super(message);
    this.name = "SprintValidationError";
  }
}

export interface FullValidation extends ValidationResult {
  schemaValid: boolean;
  schemaErrors: string[];
}

/**
 * Validação completa: schema e depois conteúdo.
 *
 * Se o schema reprova, o contrato de conteúdo não é avaliado — os tipos não são
 * confiáveis e os erros seriam ruído em cima do erro real.
 */
export function validateSprintDocument(document: unknown): FullValidation {
  const schema = validateSchema(document);
  if (!schema.valid) {
    return {
      valid: false,
      errors: [],
      warnings: [],
      schemaValid: false,
      schemaErrors: schema.errors,
    };
  }

  const sprint = (document as SprintDocument).sprint;
  const content = validateContent(sprint);
  return { ...content, schemaValid: true, schemaErrors: [] };
}

/** Relatório legível, usado no CLI, nos logs e no retorno ao agente. */
export function formatValidation(result: FullValidation): string {
  const lines: string[] = [];

  if (!result.schemaValid) {
    lines.push(`Schema inválido (${result.schemaErrors.length} erro(s)):`);
    for (const error of result.schemaErrors) lines.push(`  ✗ ${error}`);
    return lines.join("\n");
  }

  for (const issue of result.errors) {
    lines.push(`  ✗ [${issue.rule}] ${issue.path}: ${issue.message}`);
    if (issue.value) lines.push(`      "${issue.value}"`);
  }
  for (const issue of result.warnings) {
    lines.push(`  ! [${issue.rule}] ${issue.path}: ${issue.message}`);
  }

  if (result.errors.length === 0) {
    lines.unshift(
      `Contrato atendido (${result.warnings.length} aviso(s) de palavra preferencial).`,
    );
  } else {
    lines.unshift(`Contrato violado: ${result.errors.length} erro(s).`);
  }

  return lines.join("\n");
}
