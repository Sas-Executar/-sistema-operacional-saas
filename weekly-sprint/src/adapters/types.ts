/**
 * Fatos brutos coletados das fontes.
 *
 * Esta é a fronteira entre "o que as fontes dizem" e "o que a folha mostra".
 * Nada aqui foi comprimido nem reescrito: são os títulos e campos como vieram,
 * com a procedência presa a cada item. A compressão para os limites de palavra
 * acontece depois, no agente, e o validador é quem decide se o resultado vale.
 */

export interface RawTask {
  /** Identificador na fonte, ex.: "EXE-59". Vira `actions[].ref`. */
  id: string;
  /** Título como está na fonte, sem compressão. */
  title: string;
  /** Data de entrega, ISO `YYYY-MM-DD`. Decide a coluna do calendário. */
  dueDate: string | null;
  status: string;
  labels: string[];
  url: string;
  /** Issue de fase à qual pertence, ex.: "EXE-29" (D07-PH-1400). */
  parentId?: string;
}

export interface RawPhase {
  id: string;
  /** Código da fase extraído do título, ex.: "D07-PH-1400". */
  code: string;
  title: string;
  status: string;
  labels: string[];
}

export interface RawEvidence {
  /** Referência citada, ex.: "EXE-59". */
  ref: string;
  /** Onde foi citada: commit, PR ou issue. */
  kind: "commit" | "pull_request";
  identifier: string;
  url: string;
}

export interface RawWeek {
  sprintId: string;
  /** Intervalo do período, ISO. */
  from: string;
  to: string;
  cycleName?: string;
  projectName?: string;
  tasks: RawTask[];
  phases: RawPhase[];
  evidence: RawEvidence[];
  /** De onde os dados vieram, para o relatório e para auditoria. */
  provenance: string[];
}
