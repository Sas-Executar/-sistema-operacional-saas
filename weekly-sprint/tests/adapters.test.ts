import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeekFacts, dayLabel, formatPeriod, weekdayFromISO } from "../src/pipeline/facts";
import { MissingCredentialError, collectFromLinear } from "../src/adapters/linear";
import { PROJECT_ROOT } from "../src/lib/paths";
import type { RawWeek } from "../src/adapters/types";

/**
 * Os testes rodam contra dados REAIS gravados do Linear, não sintéticos, e sem
 * rede. Isso prova que o mapeamento funciona na forma verdadeira da fonte sem
 * depender de credencial nem de a API estar no ar.
 */
function recorded(): RawWeek {
  return JSON.parse(
    readFileSync(join(PROJECT_ROOT, "tests/fixtures/linear.recorded.json"), "utf8"),
  ) as RawWeek;
}

describe("datas e rótulos", () => {
  it("mapeia a data para o dia da semana", () => {
    expect(weekdayFromISO("2026-09-14")).toBe("SEG");
    expect(weekdayFromISO("2026-09-19")).toBe("SÁB");
    expect(weekdayFromISO("2026-09-20")).toBe("DOM");
  });

  it("monta o rótulo da coluna", () => {
    expect(dayLabel("2026-09-14")).toBe("SEG 14");
    expect(dayLabel("2026-09-19")).toBe("SÁB 19");
  });

  it("formata o período como no fixture normalizado", () => {
    const dates = ["2026-09-14", "2026-09-15", "2026-09-19"];
    expect(formatPeriod(dates)).toBe("14–19 set");
  });

  it("atravessa a virada de mês", () => {
    expect(formatPeriod(["2026-09-28", "2026-10-03"])).toBe("28 set – 3 out");
  });
});

describe("fatos da semana a partir do Linear real", () => {
  it("agrupa as tarefas nos seis dias com conteúdo", () => {
    const facts = buildWeekFacts(recorded());
    expect(facts.days.map((day) => day.label)).toEqual([
      "SEG 14",
      "TER 15",
      "QUA 16",
      "QUI 17",
      "SEX 18",
      "SÁB 19",
    ]);
  });

  it("põe exatamente três tarefas em cada dia", () => {
    const facts = buildWeekFacts(recorded());
    for (const day of facts.days) {
      expect(day.tasks, `${day.label} deveria ter 3 tarefas`).toHaveLength(3);
    }
  });

  it("resolve a fase de cada tarefa pelo pai", () => {
    const facts = buildWeekFacts(recorded());
    const segunda = facts.days[0];
    // EXE-59 pertence a EXE-29, que é a fase D07-PH-1400 — o código que aparece
    // como entrega na folha.
    expect(segunda.tasks[0].id).toBe("EXE-59");
    expect(segunda.tasks[0].phaseCode).toBe("D07-PH-1400");
  });

  it("preserva os rótulos da fonte", () => {
    const facts = buildWeekFacts(recorded());
    const sabado = facts.days.find((day) => day.label === "SÁB 19")!;
    const loja = sabado.tasks.find((task) => task.id === "EXE-136")!;
    expect(loja.labels).toContain("Semana Crítica");
  });

  it("deriva o período igual ao do fixture normalizado", () => {
    expect(buildWeekFacts(recorded()).period).toBe("14–19 set");
  });

  it("preserva a procedência da coleta", () => {
    const facts = buildWeekFacts(recorded());
    expect(facts.provenance.some((p) => p.startsWith("linear:team="))).toBe(true);
  });

  it("separa tarefas sem data em vez de descartá-las", () => {
    const raw = recorded();
    raw.tasks.push({
      id: "EXE-74",
      title: "D08-TASK-140033 — Testar mudança de status e releitura no Linear",
      dueDate: null,
      status: "Todo",
      labels: [],
      url: "https://linear.app/executar-rotina/issue/EXE-74",
    });

    const facts = buildWeekFacts(raw);
    expect(facts.undated.map((task) => task.id)).toEqual(["EXE-74"]);
    // Sem data não há coluna; inventar uma seria violar `no_inference`.
    expect(facts.days.flatMap((day) => day.tasks).some((t) => t.id === "EXE-74")).toBe(false);
  });

  it("anexa evidência do GitHub à tarefa citada", () => {
    const raw = recorded();
    raw.evidence = [
      {
        ref: "EXE-59",
        kind: "commit",
        identifier: "1261ffd",
        url: "https://github.com/exemplo/repo/commit/1261ffd",
      },
    ];

    const facts = buildWeekFacts(raw);
    const tarefa = facts.days[0].tasks.find((task) => task.id === "EXE-59")!;
    expect(tarefa.evidence).toHaveLength(1);
    expect(tarefa.evidence[0].identifier).toBe("1261ffd");
  });
});

describe("credenciais", () => {
  it("falha alto e explica quando LINEAR_API_KEY não existe", async () => {
    // Sem credencial o pipeline não pode inventar dados — precisa parar e dizer.
    await expect(
      collectFromLinear({ teamKey: "EXE", from: "2026-09-14", to: "2026-09-20", sprintId: "X" }),
    ).rejects.toBeInstanceOf(MissingCredentialError);
  });
});
