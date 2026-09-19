import type { SprintDay } from "./types";
import { weekColumnCount } from "./spec";

/**
 * Moldura de calendário.
 *
 * A grade tem sempre 7 colunas — uma semana completa. Os dias com conteúdo são
 * posicionados pelo prefixo do rótulo; as colunas restantes ficam em branco,
 * como num calendário comum. Um dia ausente é um espaço vazio na semana, não um
 * dado faltando: nada é inventado para preencher a grade.
 */

/** Ordem canônica dos dias da semana, em pt-BR. */
export const WEEKDAY_ORDER = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"] as const;

export type Weekday = (typeof WEEKDAY_ORDER)[number];

/** Rótulos aceitos por dia, incluindo a forma sem acento. */
const WEEKDAY_ALIASES: Record<string, Weekday> = {
  SEG: "SEG",
  TER: "TER",
  QUA: "QUA",
  QUI: "QUI",
  SEX: "SEX",
  SÁB: "SÁB",
  SAB: "SÁB",
  DOM: "DOM",
};

/**
 * Extrai o dia da semana do rótulo ("SEG 14" → "SEG").
 * Devolve `undefined` quando o prefixo não é reconhecido.
 */
export function parseWeekday(label: string): Weekday | undefined {
  const prefix = label.trim().split(/\s+/)[0]?.toUpperCase();
  if (!prefix) return undefined;
  return WEEKDAY_ALIASES[prefix];
}

/** Índice da coluna (0-based) para um rótulo de dia. */
export function slotIndex(label: string): number | undefined {
  const weekday = parseWeekday(label);
  if (!weekday) return undefined;
  const index = WEEKDAY_ORDER.indexOf(weekday);
  return index === -1 ? undefined : index;
}

export interface CalendarSlot {
  /** Dia da semana da coluna, sempre presente: a moldura é fixa. */
  weekday: Weekday;
  /** Conteúdo real, ou `null` quando a semana não tem esse dia. */
  day: SprintDay | null;
}

/**
 * Distribui os dias do sprint nas colunas da semana.
 *
 * Lança quando um rótulo não é reconhecido ou quando dois dias disputam a mesma
 * coluna — os dois casos são erro de dados, e o contrato manda falhar alto em
 * vez de descartar conteúdo em silêncio.
 */
export function buildCalendar(days: SprintDay[]): CalendarSlot[] {
  const columns = weekColumnCount();
  const slots: CalendarSlot[] = WEEKDAY_ORDER.slice(0, columns).map((weekday) => ({
    weekday,
    day: null,
  }));

  for (const day of days) {
    const index = slotIndex(day.day);
    if (index === undefined) {
      throw new Error(
        `Rótulo de dia não reconhecido: "${day.day}". Esperado um prefixo entre ${WEEKDAY_ORDER.join(", ")}.`,
      );
    }
    if (index >= slots.length) {
      throw new Error(
        `Dia "${day.day}" cai fora da moldura de ${columns} colunas.`,
      );
    }
    const slot = slots[index];
    if (slot.day) {
      throw new Error(
        `Dois dias disputam a coluna ${slot.weekday}: "${slot.day.day}" e "${day.day}".`,
      );
    }
    slot.day = day;
  }

  return slots;
}
