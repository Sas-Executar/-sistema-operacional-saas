import { describe, expect, it } from "vitest";
import { validateContent, validateSprintDocument } from "../src/lib/validators";
import { loadSprintRaw, parseSprint } from "../src/lib/loader";
import { readFileSync } from "node:fs";
import { normalizedPath } from "../src/lib/paths";
import type { SprintDocument } from "../src/lib/types";

function fixture(): SprintDocument {
  return structuredClone(loadSprintRaw("SEMANA_01"));
}

/** Frase com N palavras, para exercitar limites sem depender do texto real. */
function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `p${i + 1}`).join(" ");
}

/** Erros que dispararam para uma dada regra. */
function rules(doc: SprintDocument): string[] {
  return validateContent(doc.sprint).errors.map((e) => e.rule);
}

describe("contrato de conteúdo — fixture real", () => {
  it("SEMANA_01 passa no schema e no contrato", () => {
    const result = validateSprintDocument(fixture());
    expect(result.schemaErrors).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("loadSprint devolve o sprint validado", () => {
    const sprint = parseSprint(readFileSync(normalizedPath("SEMANA_01"), "utf8"));
    expect(sprint.id).toBe("SEMANA_01");
    expect(sprint.days).toHaveLength(6);
  });
});

describe("limites de palavras", () => {
  it("reprova week_goal acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.week_goal = words(8);
    expect(rules(doc)).toContain("week_goal");
  });

  it("aceita week_goal com exatamente 7 palavras", () => {
    const doc = fixture();
    doc.sprint.week_goal = words(7);
    expect(rules(doc)).not.toContain("week_goal");
  });

  it("reprova objetivo acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.days[0].objective = words(8);
    expect(rules(doc)).toContain("objective");
  });

  it("reprova ação acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.days[1].actions[2].text = words(8);
    expect(rules(doc)).toContain("actions");
  });

  it("reprova nota acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.days[0].note = words(8);
    expect(rules(doc)).toContain("note");
  });

  it("reprova entrega acima de 3 palavras", () => {
    const doc = fixture();
    doc.sprint.days[0].deliverables[0].text = words(4);
    expect(rules(doc)).toContain("deliverables");
  });

  it("aceita entrega com exatamente 3 palavras", () => {
    const doc = fixture();
    doc.sprint.days[0].deliverables[0].text = words(3);
    expect(rules(doc)).not.toContain("deliverables");
  });

  it("avisa, sem reprovar, acima do preferencial", () => {
    const doc = fixture();
    // 5 palavras: acima do preferencial (4), dentro do máximo (7).
    doc.sprint.days[0].objective = words(5);
    const result = validateContent(doc.sprint);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.rule === "objective")).toBe(true);
  });
});

describe("procedência e contagens", () => {
  it("reprova ação com ref vazia", () => {
    const doc = fixture();
    doc.sprint.days[0].actions[0].ref = "  ";
    expect(rules(doc)).toContain("provenance_required");
  });

  it("reprova número de ações diferente de 3", () => {
    const doc = fixture();
    doc.sprint.days[0].actions.pop();
    expect(rules(doc)).toContain("actions.count");
  });

  it("reprova número de prioridades diferente de 3", () => {
    const doc = fixture();
    doc.sprint.next_week.priorities.pop();
    expect(rules(doc)).toContain("next_week.priorities");
  });

  it("reprova prioridade acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.next_week.priorities[0].text = words(8);
    expect(rules(doc)).toContain("next_week");
  });

  it("reprova modo de review fora da enumeração", () => {
    const doc = fixture();
    (doc.sprint.review as { mode: string }).mode = "encerrada";
    expect(rules(doc)).toContain("review.modes");
  });

  it("reprova campo de review acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.review.progress = words(8);
    expect(rules(doc)).toContain("review");
  });
});

describe("extensões declaradas (D2)", () => {
  // Estes campos não existem no content_contract 1.1.0. O limite por analogia
  // está escrito no normative.yaml com declared_extension: true — o teste prova
  // que a regra é aplicada, e não apenas documentada.
  it("reprova risco acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.next_week.risks![0].text = words(8);
    expect(rules(doc)).toContain("next_week.risks (extensão)");
  });

  it("reprova label acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.next_week.label = words(8);
    expect(rules(doc)).toContain("next_week.label (extensão)");
  });

  it("reprova exceção de compliance acima de 7 palavras", () => {
    const doc = fixture();
    doc.sprint.compliance!.exceptions![0].text = words(8);
    expect(rules(doc)).toContain("compliance.exceptions (extensão)");
  });
});

describe("relatório de validação", () => {
  it("acumula todos os erros em vez de parar no primeiro", () => {
    const doc = fixture();
    doc.sprint.week_goal = words(8);
    doc.sprint.days[0].objective = words(9);
    doc.sprint.days[1].note = words(10);
    expect(validateContent(doc.sprint).errors.length).toBeGreaterThanOrEqual(3);
  });

  it("não avalia conteúdo quando o schema já reprovou", () => {
    const doc = fixture();
    doc.sprint.days[0].actions.pop();
    doc.sprint.week_goal = words(20);
    const result = validateSprintDocument(doc);
    expect(result.schemaValid).toBe(false);
    expect(result.errors).toEqual([]);
    expect(result.schemaErrors.length).toBeGreaterThan(0);
  });
});
