import { writeFileSync } from "node:fs";
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import yaml from "js-yaml";
import { z } from "zod";
import { normalizedPath } from "../src/lib/paths";
import { formatValidation, validateSprintDocument } from "../src/lib/validators";

/**
 * O portão entre o agente e o disco.
 *
 * O agente NUNCA escreve o YAML normalizado diretamente. Ele chama
 * `propose_sprint`, e só uma proposta que passa no schema e nos validadores de
 * conteúdo chega a virar arquivo. Quando reprova, os erros voltam como
 * resultado da ferramenta e o agente tenta de novo — é o
 * `overflow.failure_policy: reject_and_regenerate` do contrato implementado
 * como laço, e é o que garante que nenhuma violação alcance a folha.
 *
 * O schema declarado aqui espelha `sprint.schema.json` porque o SDK precisa de
 * um schema Zod para a ferramenta; a validação que decide continua sendo a do
 * arquivo, executada no corpo do handler.
 */

const actionSchema = z.object({
  index: z.string().describe('Ordem no dia: "01", "02" ou "03".'),
  text: z.string().describe("Ação em no máximo 7 palavras; 4 é o preferido."),
  ref: z.string().describe('Identificador de origem, ex.: "EXE-59". Obrigatório.'),
});

const deliverableSchema = z.object({
  text: z.string().describe("Resultado nominal em no máximo 3 palavras."),
  evidence_ref: z.string().optional().describe("Código de fase ou issue que evidencia a entrega."),
});

const daySchema = z.object({
  day: z.string().describe('Rótulo com prefixo do dia da semana, ex.: "SEG 14".'),
  objective: z.string().describe("Verbo + resultado, no máximo 7 palavras."),
  actions: z.array(actionSchema).length(3).describe("Exatamente 3 ações."),
  deliverables: z.array(deliverableSchema).min(1).max(3),
  note: z.string().describe("Observação em no máximo 7 palavras."),
});

const sprintSchema = z.object({
  schema_version: z.string(),
  id: z.string(),
  title: z.string(),
  period: z.string(),
  week_goal: z.string().describe("Meta da semana em no máximo 7 palavras."),
  days: z.array(daySchema).min(1).max(7),
  review: z.object({
    mode: z.enum(["scheduled", "closed"]),
    scheduled_for: z.string().optional(),
    progress: z.string().optional(),
    carryover: z.string().optional(),
  }),
  next_week: z.object({
    label: z.string().optional(),
    priorities: z
      .array(
        z.object({
          text: z.string(),
          ref: z.string().optional(),
          refs: z.array(z.string()).optional(),
        }),
      )
      .length(3),
    risks: z
      .array(
        z.object({
          text: z.string(),
          ref: z.string().optional(),
          evidence: z.string().optional(),
        }),
      )
      .optional(),
  }),
  compliance: z
    .object({
      no_inference: z.boolean().optional(),
      source_refs_required: z.boolean().optional(),
      exceptions: z
        .array(
          z.object({
            id: z.string(),
            text: z.string(),
            source: z.string().optional(),
            refs: z.array(z.string()).optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

export interface ProposalOutcome {
  accepted: boolean;
  attempts: number;
  path?: string;
  report: string;
}

/** Estado do laço de regeneração, lido pelo runner depois da execução. */
export class ProposalLog {
  attempts = 0;
  accepted = false;
  path?: string;
  lastReport = "";
}

export interface ToolReply {
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

/**
 * O portão propriamente dito, separado do encanamento do SDK.
 *
 * Fica numa função própria para que os testes possam exercitá-lo diretamente,
 * sem modelo e sem credencial: a garantia de que conteúdo inválido não chega ao
 * disco é verificável de forma determinística.
 */
export function evaluateProposal(
  sprint: z.infer<typeof sprintSchema>,
  log: ProposalLog,
  dryRun: boolean,
): ToolReply {
  log.attempts += 1;

  const document = { sprint };
  const result = validateSprintDocument(document);
  const report = formatValidation(result);
  log.lastReport = report;

  if (!result.valid) {
    // Os erros voltam ao agente como resultado da ferramenta: é assim que ele
    // sabe exatamente o que corrigir na próxima tentativa.
    return {
      content: [
        {
          type: "text",
          text:
            `PROPOSTA REJEITADA (tentativa ${log.attempts}).\n\n${report}\n\n` +
            `Corrija apenas os campos apontados e chame propose_sprint de novo. ` +
            `Não invente fatos nem remova referências de origem para encurtar texto.`,
        },
      ],
      isError: true,
    };
  }

  log.accepted = true;

  if (dryRun) {
    return {
      content: [
        {
          type: "text",
          text: `PROPOSTA APROVADA (tentativa ${log.attempts}). Simulação: nada foi gravado.\n\n${report}`,
        },
      ],
    };
  }

  const path = normalizedPath(sprint.id);
  writeFileSync(path, yaml.dump(document, { lineWidth: 100, noRefs: true }), "utf8");
  log.path = path;

  return {
    content: [
      {
        type: "text",
        text: `PROPOSTA APROVADA (tentativa ${log.attempts}) e gravada em ${path}.\n\n${report}`,
      },
    ],
  };
}

/** Servidor MCP local com a única ferramenta de escrita do agente. */
export function createSprintTools(log: ProposalLog, dryRun = false) {
  const proposeSprint = tool(
    "propose_sprint",
    "Propõe o sprint normalizado. A proposta é validada contra o schema e o " +
      "contrato de conteúdo; se reprovar, devolve a lista de erros para correção. " +
      "Só uma proposta aprovada é gravada.",
    { sprint: sprintSchema },
    async ({ sprint }) => evaluateProposal(sprint, log, dryRun),
  );

  return createSdkMcpServer({
    name: "sprint",
    version: "1.0.0",
    tools: [proposeSprint],
  });
}
