/**
 * Tipos do payload normalizado.
 *
 * Espelham `spec/sprint.schema.json`. O schema continua sendo a autoridade em
 * tempo de execução (Ajv valida contra o arquivo, não contra estes tipos);
 * estes tipos existem para o TypeScript não perder o fio depois da validação.
 */

export interface SprintAction {
  index: string;
  text: string;
  /** Referência de origem obrigatória (ex.: "EXE-59"). */
  ref: string;
}

export interface SprintDeliverable {
  text: string;
  evidence_ref?: string;
}

export interface SprintDay {
  /** Rótulo com prefixo de dia da semana, ex.: "SEG 14". */
  day: string;
  objective: string;
  actions: SprintAction[];
  deliverables: SprintDeliverable[];
  note: string;
}

export interface SprintReview {
  mode?: "scheduled" | "closed";
  scheduled_for?: string;
  progress?: string;
  carryover?: string;
}

export interface SprintPriority {
  text: string;
  ref?: string;
  refs?: string[];
}

export interface SprintRisk {
  text: string;
  ref?: string;
  evidence?: string;
}

export interface SprintNextWeek {
  label?: string;
  priorities: SprintPriority[];
  risks?: SprintRisk[];
}

export interface SprintException {
  id: string;
  text: string;
  source?: string;
  refs?: string[];
}

export interface SprintCompliance {
  no_inference?: boolean;
  source_refs_required?: boolean;
  exceptions?: SprintException[];
}

export interface Sprint {
  schema_version: string;
  id: string;
  title: string;
  period: string;
  week_goal: string;
  days: SprintDay[];
  review: SprintReview;
  next_week: SprintNextWeek;
  compliance?: SprintCompliance;
}

export interface SprintDocument {
  sprint: Sprint;
}
