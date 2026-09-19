import { readFileSync } from "node:fs";
import { join } from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { PROJECT_ROOT } from "../src/lib/paths";
import { loadSpec } from "../src/lib/spec";
import { buildWeekFacts, type WeekFacts } from "../src/pipeline/facts";
import { collectFromLinear } from "../src/adapters/linear";
import { collectFromGitHub } from "../src/adapters/github";
import { ProposalLog, createSprintTools } from "./tools";
import type { RawWeek } from "../src/adapters/types";

/**
 * O agente semanal.
 *
 * Única etapa do pipeline em que a IA age, e com escopo estreito de propósito:
 * comprimir linguagem sob limites de palavra, preservando significado e
 * procedência. Geometria, validação e PDF são código determinístico.
 *
 * O agente não tem acesso a escrita de arquivos: sua única ferramenta de saída
 * é `propose_sprint`, que passa pelo validador. Se ele tentar contornar um
 * limite inventando texto sem referência, a proposta é rejeitada.
 */

export interface RunOptions {
  sprintId: string;
  source: "linear" | "fixture";
  from: string;
  to: string;
  teamKey: string;
  dryRun: boolean;
  maxAttempts: number;
  repo?: { owner: string; repo: string };
}

/** Coleta os fatos, do Linear ao vivo ou do fixture gravado. */
export async function collectFacts(options: RunOptions): Promise<WeekFacts> {
  if (options.source === "fixture") {
    const raw = JSON.parse(
      readFileSync(join(PROJECT_ROOT, "tests/fixtures/linear.recorded.json"), "utf8"),
    ) as RawWeek;
    return buildWeekFacts(raw);
  }

  const raw = await collectFromLinear({
    teamKey: options.teamKey,
    from: options.from,
    to: options.to,
    sprintId: options.sprintId,
  });

  if (options.repo) {
    const { evidence, provenance } = await collectFromGitHub({
      owner: options.repo.owner,
      repo: options.repo.repo,
      since: `${options.from}T00:00:00Z`,
      until: `${options.to}T23:59:59Z`,
    });
    raw.evidence = evidence;
    raw.provenance = [...raw.provenance, ...provenance];
  }

  return buildWeekFacts(raw);
}

/** Monta a instrução do agente a partir do contrato e dos fatos coletados. */
export function buildPrompt(facts: WeekFacts, sprintId: string): string {
  const spec = loadSpec();
  const contract = spec.content_contract;

  const factLines = facts.days
    .map((day) => {
      const tasks = day.tasks
        .map((task) => {
          const parts = [`    - ${task.id}: ${task.title}`];
          if (task.phaseCode) parts.push(`      fase: ${task.phaseCode} (${task.phaseTitle})`);
          if (task.labels.length) parts.push(`      rótulos: ${task.labels.join(", ")}`);
          if (task.evidence.length) {
            parts.push(
              `      evidência: ${task.evidence.map((e) => `${e.kind} ${e.identifier}`).join(", ")}`,
            );
          }
          return parts.join("\n");
        })
        .join("\n");
      return `  ${day.label} (${day.date}):\n${tasks}`;
    })
    .join("\n\n");

  const undated = facts.undated.length
    ? `\nTAREFAS SEM DATA (não entram em nenhuma coluna; não invente data):\n` +
      facts.undated.map((task) => `  - ${task.id}: ${task.title}`).join("\n")
    : "";

  return `Você normaliza um sprint operacional semanal para uma folha A4 impressa.

FATOS COLETADOS DAS FONTES (única verdade disponível):

${factLines}${undated}

Período: ${facts.period}
Ciclo: ${facts.cycleName ?? "não informado"}
Projeto: ${facts.projectName ?? "não informado"}
Procedência: ${facts.provenance.join("; ")}

SUA TAREFA
Comprimir estes fatos no formato do sprint e chamar a ferramenta propose_sprint.

LIMITES DE PALAVRAS (rígidos — a proposta é rejeitada se violar)
- week_goal: máx ${contract.week_goal.max_words}, ideal ${contract.week_goal.preferred_words}
- objective: máx ${contract.objective.max_words}, ideal ${contract.objective.preferred_words} (verbo + resultado)
- actions[].text: máx ${contract.actions.max_words}, ideal ${contract.actions.preferred_words} (verbo + objeto + resultado)
- deliverables[].text: máx ${contract.deliverables.max_words} (resultado nominal), ${contract.deliverables.min_items} a ${contract.deliverables.max_items} por dia
- note: máx ${contract.note.max_words}
- review: máx ${contract.review.max_words_per_field} por campo
- next_week.priorities: exatamente ${contract.next_week.priorities}, máx ${contract.next_week.max_words_each} cada

Identificadores como "D07-PH-1400" e "EXE-74/75" contam como UMA palavra.

REGRAS INVIOLÁVEIS
1. Não invente fatos. Toda ação recebe o ref da issue de onde veio.
2. Exatamente 3 ações por dia, na ordem dos fatos, com index "01", "02", "03".
3. O rótulo do dia deve começar com SEG, TER, QUA, QUI, SEX, SÁB ou DOM.
4. Entregas saem dos códigos de fase e dos resultados das tarefas do dia.
5. Para comprimir, remova modificadores e encurte a expressão — NUNCA remova o
   resultado, a referência ou o significado. Se não der para respeitar o limite
   sem mudar o sentido, prefira falhar a distorcer.
6. Use id "${sprintId}" e schema_version "${spec.spec.version}".
7. review.mode = "scheduled" enquanto a semana não fechou. Não relate progresso
   que os fatos não sustentam.
8. Registre em compliance.exceptions o que ficou sem lastro (ex.: tarefas sem
   data, pré-requisitos abertos), em vez de preencher por inferência.

Chame propose_sprint. Se a proposta for rejeitada, leia os erros, corrija apenas
os campos apontados e chame de novo.`;
}

function parseArgs(argv: string[]): RunOptions {
  const get = (name: string, fallback?: string): string | undefined => {
    const hit = argv.find((arg) => arg.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
  };

  return {
    sprintId: get("sprint", "SEMANA_01")!,
    source: (get("source", "fixture") as "linear" | "fixture") ?? "fixture",
    from: get("from", "2026-09-14")!,
    to: get("to", "2026-09-20")!,
    teamKey: get("team", "EXE")!,
    dryRun: argv.includes("--dry-run"),
    maxAttempts: Number(get("max-attempts", "4")),
    repo: process.env.GITHUB_REPOSITORY
      ? {
          owner: process.env.GITHUB_REPOSITORY.split("/")[0],
          repo: process.env.GITHUB_REPOSITORY.split("/")[1],
        }
      : undefined,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  console.log(`Coletando fatos (fonte: ${options.source})…`);
  const facts = await collectFacts(options);
  console.log(`  ${facts.days.length} dia(s) com conteúdo, período ${facts.period}`);
  if (facts.undated.length) {
    console.log(`  ${facts.undated.length} tarefa(s) sem data — reportadas, não posicionadas`);
  }

  const log = new ProposalLog();
  const tools = createSprintTools(log, options.dryRun);

  console.log("Normalizando com o agente…");
  for await (const message of query({
    prompt: buildPrompt(facts, options.sprintId),
    options: {
      cwd: PROJECT_ROOT,
      model: "claude-opus-5",
      // O agente não recebe ferramentas de arquivo nem de shell: a única saída
      // é propose_sprint, que passa pelo validador.
      allowedTools: ["mcp__sprint__propose_sprint"],
      mcpServers: { sprint: tools },
      // Carrega o plugin do repositório, que traz a skill e o subagente.
      plugins: [{ type: "local", path: join(PROJECT_ROOT, "plugin") }],
      maxTurns: options.maxAttempts * 2,
      permissionMode: "default",
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log(`  plugins: ${JSON.stringify(message.plugins ?? [])}`);
    }
    if (message.type === "result") {
      console.log(`  turnos: ${"num_turns" in message ? message.num_turns : "?"}`);
    }
  }

  console.log(`\nTentativas de proposta: ${log.attempts}`);
  if (!log.accepted) {
    console.error("Nenhuma proposta passou na validação. Último relatório:\n");
    console.error(log.lastReport);
    process.exit(1);
  }

  console.log(log.path ? `Gravado em ${log.path}` : "Simulação: nada gravado.");
  console.log(log.lastReport);
}

// Só executa quando chamado direto, para os testes poderem importar as funções.
if (process.argv[1]?.endsWith("run-week.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
