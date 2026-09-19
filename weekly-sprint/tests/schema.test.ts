import { describe, expect, it } from "vitest";
import { validateSchema } from "../src/lib/schema";
import { loadSprintRaw } from "../src/lib/loader";
import type { SprintDocument } from "../src/lib/types";

/** Cópia profunda, para cada teste mutar sem contaminar o seguinte. */
function fixture(): SprintDocument {
  return structuredClone(loadSprintRaw("SEMANA_01"));
}

describe("schema estrutural", () => {
  it("aceita o fixture SEMANA_01 como está", () => {
    const result = validateSchema(fixture());
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("reprova dia com menos de 3 ações", () => {
    const doc = fixture();
    doc.sprint.days[0].actions.pop();
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("reprova dia com mais de 3 ações", () => {
    const doc = fixture();
    const extra = structuredClone(doc.sprint.days[0].actions[0]);
    doc.sprint.days[0].actions.push(extra);
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("reprova ação sem ref", () => {
    const doc = fixture();
    delete (doc.sprint.days[0].actions[0] as { ref?: string }).ref;
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("reprova campo desconhecido dentro de uma ação", () => {
    const doc = fixture();
    (doc.sprint.days[0].actions[0] as unknown as Record<string, unknown>).owner = "alguém";
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("reprova mais de 3 entregas num dia", () => {
    const doc = fixture();
    doc.sprint.days[0].deliverables = [
      { text: "Um" },
      { text: "Dois" },
      { text: "Três" },
      { text: "Quatro" },
    ];
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("reprova dia sem entregas", () => {
    const doc = fixture();
    doc.sprint.days[0].deliverables = [];
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("reprova sprint sem campo obrigatório", () => {
    const doc = fixture();
    delete (doc.sprint as { week_goal?: string }).week_goal;
    expect(validateSchema(doc).valid).toBe(false);
  });

  it("aceita a moldura emendada de até 7 dias", () => {
    const doc = fixture();
    const domingo = structuredClone(doc.sprint.days[0]);
    domingo.day = "DOM 20";
    doc.sprint.days.push(domingo);
    expect(validateSchema(doc).valid).toBe(true);
  });

  it("reprova mais de 7 dias", () => {
    const doc = fixture();
    while (doc.sprint.days.length <= 7) {
      doc.sprint.days.push(structuredClone(doc.sprint.days[0]));
    }
    expect(validateSchema(doc).valid).toBe(false);
  });
});
