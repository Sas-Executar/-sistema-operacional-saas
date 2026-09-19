import { describe, expect, it } from "vitest";
import { ProposalLog, evaluateProposal } from "../agent/tools";
import { loadSprintRaw } from "../src/lib/loader";
import { buildPrompt } from "../agent/run-week";
import { buildWeekFacts } from "../src/pipeline/facts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PROJECT_ROOT } from "../src/lib/paths";
import type { RawWeek } from "../src/adapters/types";
import type { Sprint } from "../src/lib/types";

/**
 * O portão entre o agente e o disco.
 *
 * Esta é a propriedade de segurança central do desenho: o agente não consegue
 * gravar um sprint que viole o contrato, por mais convincente que a proposta
 * pareça. Os testes exercitam o handler da ferramenta diretamente, sem modelo,
 * o que os torna determinísticos e executáveis sem credencial.
 */

/** Chama o portão que a ferramenta `propose_sprint` executa, em simulação. */
function propose(sprint: Sprint, log: ProposalLog) {
  return evaluateProposal(sprint as Parameters<typeof evaluateProposal>[0], log, true);
}

function validSprint(): Sprint {
  return structuredClone(loadSprintRaw("SEMANA_01")).sprint;
}

describe("propose_sprint como portão de contrato", () => {
  it("aceita o sprint válido e registra a aprovação", () => {
    const log = new ProposalLog();
    const result = propose(validSprint(), log);

    expect(result.isError).toBeFalsy();
    expect(log.accepted).toBe(true);
    expect(log.attempts).toBe(1);
    expect(result.content[0].text).toContain("APROVADA");
  });

  it("não grava nada em modo de simulação", () => {
    const log = new ProposalLog();
    propose(validSprint(), log);
    expect(log.path).toBeUndefined();
  });

  it("rejeita ação acima do limite de palavras", () => {
    const sprint = validSprint();
    sprint.days[0].actions[0].text = "uma ação deliberadamente longa com nove palavras aqui";

    const log = new ProposalLog();
    const result = propose(sprint, log);

    expect(result.isError).toBe(true);
    expect(log.accepted).toBe(false);
    expect(result.content[0].text).toContain("REJEITADA");
    // O agente precisa saber ONDE corrigir, não só que falhou.
    expect(result.content[0].text).toContain("sprint.days[0].actions[0].text");
  });

  it("rejeita ação sem referência de origem", () => {
    const sprint = validSprint();
    sprint.days[2].actions[1].ref = "";

    const log = new ProposalLog();
    const result = propose(sprint, log);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("provenance_required");
  });

  it("rejeita dia com número errado de ações", () => {
    const sprint = validSprint();
    sprint.days[1].actions.pop();

    const log = new ProposalLog();
    const result = propose(sprint, log);

    expect(result.isError).toBe(true);
    expect(log.accepted).toBe(false);
  });

  it("rejeita rótulo de dia que não cabe no calendário", () => {
    const sprint = validSprint();
    sprint.days[0].day = "LUN 14";

    const log = new ProposalLog();
    const result = propose(sprint, log);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("calendar");
  });

  it("instrui a corrigir sem inventar fatos nem remover referências", () => {
    const sprint = validSprint();
    sprint.week_goal = "meta deliberadamente longa com mais de sete palavras neste texto";

    const log = new ProposalLog();
    const result = propose(sprint, log);

    expect(result.content[0].text).toContain("Não invente fatos");
    expect(result.content[0].text).toContain("referências de origem");
  });

  it("conta cada tentativa, para o laço de regeneração ser auditável", () => {
    const log = new ProposalLog();
    const ruim = validSprint();
    ruim.days[0].note = "nota deliberadamente longa com mais de sete palavras aqui dentro";

    propose(ruim, log);
    propose(ruim, log);
    propose(validSprint(), log);

    expect(log.attempts).toBe(3);
    expect(log.accepted).toBe(true);
  });
});

describe("instrução do agente", () => {
  function facts() {
    const raw = JSON.parse(
      readFileSync(join(PROJECT_ROOT, "tests/fixtures/linear.recorded.json"), "utf8"),
    ) as RawWeek;
    return buildWeekFacts(raw);
  }

  it("leva os limites do contrato, não números escritos à mão", () => {
    const prompt = buildPrompt(facts(), "SEMANA_01");
    expect(prompt).toContain("week_goal: máx 7, ideal 4");
    expect(prompt).toContain("deliverables[].text: máx 3");
    expect(prompt).toContain("exatamente 3");
  });

  it("leva os fatos com identificador e fase", () => {
    const prompt = buildPrompt(facts(), "SEMANA_01");
    expect(prompt).toContain("EXE-59");
    expect(prompt).toContain("D07-PH-1400");
    expect(prompt).toContain("SEG 14");
  });

  it("proíbe inventar data para tarefa sem prazo", () => {
    const raw = JSON.parse(
      readFileSync(join(PROJECT_ROOT, "tests/fixtures/linear.recorded.json"), "utf8"),
    ) as RawWeek;
    raw.tasks.push({
      id: "EXE-74",
      title: "D08-TASK-140033 — Testar mudança de status e releitura no Linear",
      dueDate: null,
      status: "Todo",
      labels: [],
      url: "https://linear.app/executar-rotina/issue/EXE-74",
    });

    const prompt = buildPrompt(buildWeekFacts(raw), "SEMANA_01");
    expect(prompt).toContain("TAREFAS SEM DATA");
    expect(prompt).toContain("não invente data");
    expect(prompt).toContain("EXE-74");
  });
});
