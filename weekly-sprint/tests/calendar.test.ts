import { describe, expect, it } from "vitest";
import { buildCalendar, parseWeekday, slotIndex, WEEKDAY_ORDER } from "../src/lib/calendar";
import { loadSprint } from "../src/lib/loader";
import type { SprintDay } from "../src/lib/types";

function day(label: string): SprintDay {
  return {
    day: label,
    objective: "Objetivo curto",
    actions: [
      { index: "01", text: "Ação um", ref: "EXE-1" },
      { index: "02", text: "Ação dois", ref: "EXE-2" },
      { index: "03", text: "Ação três", ref: "EXE-3" },
    ],
    deliverables: [{ text: "Entrega feita" }],
    note: "Nota curta",
  };
}

describe("rótulos de dia", () => {
  it("extrai o dia da semana do rótulo", () => {
    expect(parseWeekday("SEG 14")).toBe("SEG");
    expect(parseWeekday("SÁB 19")).toBe("SÁB");
  });

  it("aceita SAB sem acento", () => {
    expect(parseWeekday("SAB 19")).toBe("SÁB");
    expect(slotIndex("SAB 19")).toBe(5);
  });

  it("é indiferente a caixa", () => {
    expect(parseWeekday("seg 14")).toBe("SEG");
  });

  it("devolve undefined para prefixo desconhecido", () => {
    expect(parseWeekday("LUN 14")).toBeUndefined();
  });

  it("mapeia SEG..DOM para as colunas 0..6", () => {
    const indices = WEEKDAY_ORDER.map((w) => slotIndex(`${w} 01`));
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("moldura de calendário", () => {
  it("tem sempre 7 colunas, independente dos dias preenchidos", () => {
    expect(buildCalendar([day("SEG 14")])).toHaveLength(7);
    expect(buildCalendar([day("SEG 14"), day("TER 15")])).toHaveLength(7);
  });

  it("deixa o domingo em branco para a SEMANA_01", () => {
    // O fixture tem 6 dias reais (SEG→SÁB). O 7º slot fica vazio: é uma
    // coluna de calendário, não um dado inventado.
    const calendar = buildCalendar(loadSprint("SEMANA_01").days);
    expect(calendar.filter((s) => s.day !== null)).toHaveLength(6);
    expect(calendar[6].weekday).toBe("DOM");
    expect(calendar[6].day).toBeNull();
  });

  it("posiciona cada dia na sua coluna, não na ordem do array", () => {
    const calendar = buildCalendar([day("QUA 16"), day("SEG 14")]);
    expect(calendar[0].day?.day).toBe("SEG 14");
    expect(calendar[1].day).toBeNull();
    expect(calendar[2].day?.day).toBe("QUA 16");
  });

  it("suporta uma semana de 5 dias úteis", () => {
    const calendar = buildCalendar(
      ["SEG 14", "TER 15", "QUA 16", "QUI 17", "SEX 18"].map(day),
    );
    expect(calendar.filter((s) => s.day !== null)).toHaveLength(5);
    expect(calendar[5].day).toBeNull();
    expect(calendar[6].day).toBeNull();
  });

  it("suporta a semana completa de 7 dias", () => {
    const calendar = buildCalendar(WEEKDAY_ORDER.map((w) => day(`${w} 01`)));
    expect(calendar.every((s) => s.day !== null)).toBe(true);
  });

  it("falha alto em rótulo desconhecido", () => {
    expect(() => buildCalendar([day("LUN 14")])).toThrow(/não reconhecido/);
  });

  it("falha alto quando dois dias disputam a mesma coluna", () => {
    expect(() => buildCalendar([day("SEG 14"), day("SEG 21")])).toThrow(/disputam/);
  });
});
