import { loadSpec, weekColumnCount, type NormativeSpec } from "./spec";

/**
 * Tokens de layout: do `normative.yaml` para CSS custom properties.
 *
 * Todas as medidas saem em `mm` ou `pt`. Nenhum `px` entra na geometria: o
 * contrato manda que a unidade física seja a fonte de verdade
 * (`AGENTS.md`: "Print geometry must use mm/pt, not screen px").
 *
 * ## Papéis tipográficos ausentes no contrato
 *
 * `layout.day_structure` e `layout.order` citam `week_goal`, `objective`,
 * `note`, `weekly_close` e `next_week`, mas `typography` só define tamanho para
 * `title`, `day`, `section`, `task`, `deliverable` e `metadata`. O mapeamento
 * abaixo é nosso, não do spec, e está registrado como divergência:
 *
 * | Elemento     | Papel usado   | Por quê                                    |
 * |--------------|---------------|--------------------------------------------|
 * | week_goal    | `day`         | é a segunda voz da folha, abaixo do título |
 * | objective    | `deliverable` | frase de resultado, acima da tarefa        |
 * | note         | `metadata`    | comentário de rodapé da coluna             |
 * | review       | `task`        | mesma densidade das ações                  |
 * | next_week    | `task`        | idem                                       |
 *
 * Trocar um desses mapeamentos muda a altura das colunas, então o gate de
 * estouro precisa rodar de novo depois de qualquer alteração aqui.
 */

/** Cinzas do contrato (K = percentual de preto) em hexadecimal. */
const K_SCALE: Record<string, string> = {
  K100: "#000000",
  K65: "#595959",
  K50: "#808080",
  K30: "#b3b3b3",
  K15: "#d9d9d9",
};

function k(value: unknown, fallback: string): string {
  return typeof value === "string" && K_SCALE[value] ? K_SCALE[value] : fallback;
}

export interface LayoutTokens {
  columns: number;
  /** Largura calculada de uma coluna, em mm — usada pelos testes de geometria. */
  columnWidthMm: number;
  css: Record<string, string>;
}

/** Monta as custom properties a partir do contrato. */
export function buildTokens(spec: NormativeSpec = loadSpec()): LayoutTokens {
  const columns = weekColumnCount(spec);
  const [widthMm, heightMm] = spec.canvas.size_mm;
  const margin = spec.canvas.safe_margin_mm;
  const gutter = spec.grid.gutter_mm;
  const color = spec.color as Record<string, unknown>;
  const t = spec.typography;

  const columnWidthMm =
    (widthMm - 2 * margin - gutter * (columns - 1)) / columns;

  const css: Record<string, string> = {
    "--sheet-width": `${widthMm}mm`,
    "--sheet-height": `${heightMm}mm`,
    "--safe-margin": `${margin}mm`,
    "--gutter": `${gutter}mm`,
    "--columns": String(columns),
    "--baseline": `${spec.grid.baseline_pt}pt`,
    "--optical-adjust": `${spec.grid.optical_adjustment_pt}pt`,

    // Passo base da escala fluent. O contrato define `spacing.base_pt: 4` e o
    // inclui em `scale_pt`; é o degrau correto entre itens de uma mesma lista,
    // enquanto `label_to_content` separa rótulo de conteúdo.
    "--space-base": `${spec.spacing.base_pt}pt`,
    "--space-label": `${spec.spacing.label_to_content}pt`,
    "--space-related": `${spec.spacing.related_items}pt`,
    "--space-block": `${spec.spacing.block_gap}pt`,
    "--space-section": `${spec.spacing.section_gap}pt`,

    "--text-primary": k(color.text_primary, "#000000"),
    "--text-secondary": k(color.text_secondary, "#595959"),
    "--text-metadata": k(color.metadata, "#808080"),
    "--rule-guide": k(color.guide, "#d9d9d9"),
    "--placeholder": k(color.placeholder, "#b3b3b3"),

    "--min-text": `${t.min_text_pt}pt`,
  };

  // Papéis definidos pelo contrato, emitidos como estão.
  for (const role of ["title", "day", "section", "task", "deliverable", "metadata"] as const) {
    const r = t[role];
    css[`--${role}-size`] = `${r.size_pt}pt`;
    css[`--${role}-weight`] = String(r.weight);
    css[`--${role}-leading`] = `${r.leading_pt}pt`;
  }

  return { columns, columnWidthMm, css };
}

/** Serializa os tokens para o atributo `style` da folha. */
export function tokensToStyle(tokens: LayoutTokens = buildTokens()): Record<string, string> {
  return tokens.css;
}
