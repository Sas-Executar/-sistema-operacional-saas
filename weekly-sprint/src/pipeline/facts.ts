import { WEEKDAY_ORDER, type Weekday } from "../lib/calendar";
import type { RawWeek, RawTask, RawEvidence } from "../adapters/types";

/**
 * Organiza os fatos brutos no formato que o agente recebe.
 *
 * Esta etapa é inteiramente determinística: agrupa por dia, resolve a fase de
 * cada tarefa e anexa evidência. O agente recebe fatos já organizados e só
 * precisa fazer o que código não faz bem — comprimir linguagem sem perder
 * significado. Quanto mais decisão fica aqui, menos espaço o modelo tem para
 * improvisar.
 */

/** Dia da semana de uma data ISO, na ordem SEG..DOM do calendário. */
export function weekdayFromISO(iso: string): Weekday {
  // getUTCDay(): 0=domingo. A moldura começa na segunda.
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return WEEKDAY_ORDER[(day + 6) % 7];
}

/** Rótulo da coluna, ex.: "SEG 14". */
export function dayLabel(iso: string): string {
  const dayOfMonth = new Date(`${iso}T00:00:00Z`).getUTCDate();
  return `${weekdayFromISO(iso)} ${dayOfMonth}`;
}

export interface DayFacts {
  label: string;
  date: string;
  tasks: {
    id: string;
    title: string;
    labels: string[];
    /** Código da fase a que a tarefa pertence, quando há. */
    phaseCode?: string;
    phaseTitle?: string;
    evidence: RawEvidence[];
  }[];
}

export interface WeekFacts {
  sprintId: string;
  period: string;
  cycleName?: string;
  projectName?: string;
  days: DayFacts[];
  /** Tarefas sem data: não entram em nenhuma coluna. Reportadas, não descartadas. */
  undated: RawTask[];
  provenance: string[];
}

/** Período legível, ex.: "14–19 set". */
export function formatPeriod(dates: string[]): string {
  if (dates.length === 0) return "";
  const sorted = [...dates].sort();
  const first = new Date(`${sorted[0]}T00:00:00Z`);
  const last = new Date(`${sorted[sorted.length - 1]}T00:00:00Z`);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  const sameMonth = first.getUTCMonth() === last.getUTCMonth();
  return sameMonth
    ? `${first.getUTCDate()}–${last.getUTCDate()} ${months[last.getUTCMonth()]}`
    : `${first.getUTCDate()} ${months[first.getUTCMonth()]} – ${last.getUTCDate()} ${months[last.getUTCMonth()]}`;
}

/** Converte a coleta bruta em fatos por dia. */
export function buildWeekFacts(raw: RawWeek): WeekFacts {
  const phasesById = new Map(raw.phases.map((phase) => [phase.id, phase]));

  const evidenceByRef = new Map<string, RawEvidence[]>();
  for (const item of raw.evidence) {
    const list = evidenceByRef.get(item.ref) ?? [];
    list.push(item);
    evidenceByRef.set(item.ref, list);
  }

  const byDate = new Map<string, DayFacts>();
  const undated: RawTask[] = [];

  for (const task of raw.tasks) {
    if (!task.dueDate) {
      // Sem data não há coluna. Some da folha, mas não do relatório: o contrato
      // proíbe inventar, e inventar uma data seria exatamente isso.
      undated.push(task);
      continue;
    }

    const day = byDate.get(task.dueDate) ?? {
      label: dayLabel(task.dueDate),
      date: task.dueDate,
      tasks: [],
    };

    const phase = task.parentId ? phasesById.get(task.parentId) : undefined;
    day.tasks.push({
      id: task.id,
      title: task.title,
      labels: task.labels,
      phaseCode: phase?.code,
      phaseTitle: phase?.title,
      evidence: evidenceByRef.get(task.id) ?? [],
    });

    byDate.set(task.dueDate, day);
  }

  const days = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    sprintId: raw.sprintId,
    period: formatPeriod(days.map((day) => day.date)),
    cycleName: raw.cycleName,
    projectName: raw.projectName,
    days,
    undated,
    provenance: raw.provenance,
  };
}
