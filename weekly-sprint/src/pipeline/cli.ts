import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PROJECT_ROOT, normalizedPath } from "../lib/paths";
import { loadSprint } from "../lib/loader";
import { SprintValidationError, formatValidation, validateSprintDocument } from "../lib/validators";
import { buildCalendar } from "../lib/calendar";
import { buildWeekFacts } from "./facts";
import { collectFromLinear } from "../adapters/linear";
import { collectFromGitHub } from "../adapters/github";
import type { RawWeek } from "../adapters/types";
import yaml from "js-yaml";

/**
 * CLI do pipeline, sem IA.
 *
 * Três verbos:
 *   collect   — coleta fatos das fontes e mostra o que foi encontrado
 *   validate  — valida um YAML normalizado contra schema e contrato
 *   status    — resume o sprint e a ocupação do calendário
 *
 * A normalização por IA fica em `agent/run-week.ts`; aqui tudo é determinístico,
 * o que torna este CLI utilizável em CI sem chave de modelo.
 */

interface Args {
  command: string;
  sprintId: string;
  source: "linear" | "fixture";
  from: string;
  to: string;
  teamKey: string;
}

function parseArgs(argv: string[]): Args {
  const get = (name: string, fallback: string): string => {
    const hit = argv.find((arg) => arg.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
  };

  return {
    command: argv.find((arg) => !arg.startsWith("--")) ?? "status",
    sprintId: get("sprint", "SEMANA_01"),
    source: get("source", "fixture") as "linear" | "fixture",
    from: get("from", "2026-09-14"),
    to: get("to", "2026-09-20"),
    teamKey: get("team", "EXE"),
  };
}

async function commandCollect(args: Args): Promise<void> {
  let raw: RawWeek;

  if (args.source === "fixture") {
    raw = JSON.parse(
      readFileSync(join(PROJECT_ROOT, "tests/fixtures/linear.recorded.json"), "utf8"),
    ) as RawWeek;
    console.log("Fonte: fixture gravado (sem rede, sem credencial)");
  } else {
    raw = await collectFromLinear({
      teamKey: args.teamKey,
      from: args.from,
      to: args.to,
      sprintId: args.sprintId,
    });
    const { evidence, provenance } = await collectFromGitHub({
      owner: process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "",
      repo: process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "",
      since: `${args.from}T00:00:00Z`,
      until: `${args.to}T23:59:59Z`,
    });
    raw.evidence = evidence;
    raw.provenance = [...raw.provenance, ...provenance];
    console.log("Fonte: Linear ao vivo");
  }

  const facts = buildWeekFacts(raw);

  console.log(`\nSprint ${facts.sprintId} · ${facts.period}`);
  console.log(`Projeto: ${facts.projectName ?? "—"} · Ciclo: ${facts.cycleName ?? "—"}`);
  console.log(`Procedência: ${facts.provenance.join("; ")}\n`);

  for (const day of facts.days) {
    console.log(`${day.label}  (${day.tasks.length} tarefa(s))`);
    for (const task of day.tasks) {
      const phase = task.phaseCode ? ` [${task.phaseCode}]` : "";
      const evidence = task.evidence.length ? ` ✓${task.evidence.length}` : "";
      console.log(`  ${task.id}${phase}${evidence}  ${task.title}`);
    }
  }

  if (facts.undated.length) {
    console.log(`\nSem data (${facts.undated.length}) — não entram em coluna alguma:`);
    for (const task of facts.undated) console.log(`  ${task.id}  ${task.title}`);
  }
}

function commandValidate(args: Args): void {
  const path = normalizedPath(args.sprintId);
  const document = yaml.load(readFileSync(path, "utf8"));
  const result = validateSprintDocument(document);

  console.log(`Validando ${path}\n`);
  console.log(formatValidation(result));

  if (!result.valid) process.exit(1);
}

function commandStatus(args: Args): void {
  const sprint = loadSprint(args.sprintId);
  const calendar = buildCalendar(sprint.days);

  console.log(`${sprint.title}`);
  console.log(`${sprint.id} · ${sprint.period} · schema ${sprint.schema_version}`);
  console.log(`Meta: ${sprint.week_goal}\n`);

  for (const slot of calendar) {
    if (!slot.day) {
      console.log(`  ${slot.weekday.padEnd(7)} —  (coluna em branco)`);
      continue;
    }
    console.log(
      `  ${slot.weekday.padEnd(7)} ${slot.day.day.padEnd(8)} ` +
        `${slot.day.actions.length} ações, ${slot.day.deliverables.length} entregas`,
    );
  }

  const refs = sprint.days.flatMap((day) => day.actions.map((action) => action.ref));
  console.log(`\nReferências de origem: ${refs.length} (${new Set(refs).size} distintas)`);
  console.log(`Fechamento: ${sprint.review.mode ?? "—"}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  try {
    switch (args.command) {
      case "collect":
        await commandCollect(args);
        break;
      case "validate":
        commandValidate(args);
        break;
      case "status":
        commandStatus(args);
        break;
      default:
        console.error(`Comando desconhecido: ${args.command}`);
        console.error("Use: collect | validate | status");
        process.exit(2);
    }
  } catch (error) {
    if (error instanceof SprintValidationError) {
      console.error(error.message);
      console.error(
        formatValidation({
          valid: false,
          errors: error.result.errors,
          warnings: error.result.warnings,
          schemaValid: error.schemaErrors.length === 0,
          schemaErrors: error.schemaErrors,
        }),
      );
      process.exit(1);
    }
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
