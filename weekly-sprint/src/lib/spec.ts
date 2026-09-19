import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { NORMATIVE_PATH } from "./paths";

/**
 * Leitura tipada do `spec/normative.yaml`.
 *
 * Os limites vivem no contrato, não no código. Validadores e tokens de layout
 * leem daqui, de modo que mudar um limite ou um tamanho de fonte é editar o
 * YAML — e os testes pegam a mudança.
 */

export interface WordLimit {
  preferred_words?: number;
  max_words?: number;
  declared_extension?: boolean;
}

export interface TypographyRole {
  size_pt: number;
  weight: number;
  leading_pt: number;
}

export interface NormativeSpec {
  spec: { name: string; version: string; purpose: string };
  content_contract: {
    week_goal: WordLimit;
    objective: WordLimit;
    actions: WordLimit & { count: number };
    deliverables: WordLimit & { min_items: number; max_items: number };
    note: WordLimit;
    review: { max_words_per_field: number; modes: string[] };
    next_week: {
      priorities: number;
      max_words_each: number;
      label?: WordLimit;
      risks?: { max_words_each: number; declared_extension?: boolean };
    };
    compliance?: {
      exceptions?: { max_words_each: number; declared_extension?: boolean };
    };
  };
  overflow: {
    font_shrink: boolean;
    truncate: boolean;
    failure_policy: string;
  };
  canvas: {
    sheet: string;
    size_mm: [number, number];
    safe_margin_mm: number;
  };
  grid: {
    supported_day_count: number[];
    gutter_mm: number;
    baseline_pt: number;
    optical_adjustment_pt: number;
  };
  spacing: {
    base_pt: number;
    label_to_content: number;
    related_items: number;
    block_gap: number;
    section_gap: number;
    major_gap: number;
  };
  typography: Record<string, TypographyRole | number | boolean | string> & {
    title: TypographyRole;
    day: TypographyRole;
    section: TypographyRole;
    task: TypographyRole;
    deliverable: TypographyRole;
    metadata: TypographyRole;
    min_text_pt: number;
    shrink_to_fit: boolean;
  };
  color: Record<string, unknown>;
}

let cached: NormativeSpec | undefined;

/** Carrega (e memoiza) o contrato normativo. */
export function loadSpec(): NormativeSpec {
  if (!cached) {
    cached = yaml.load(readFileSync(NORMATIVE_PATH, "utf8")) as NormativeSpec;
  }
  return cached;
}

/** Número de colunas do calendário. O contrato fixa uma semana completa. */
export function weekColumnCount(spec: NormativeSpec = loadSpec()): number {
  const supported = spec.grid.supported_day_count;
  if (!supported?.length) {
    throw new Error("normative.yaml: grid.supported_day_count está vazio");
  }
  // Com a moldura de calendário fixa, o contrato declara um único valor.
  return Math.max(...supported);
}
