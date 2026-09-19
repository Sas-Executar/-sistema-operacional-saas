import type { RawPhase, RawTask, RawWeek } from "./types";

/**
 * Adaptador do Linear.
 *
 * Coleta as issues da semana e as issues de fase, preservando identificadores.
 * Não comprime texto e não decide significado — só traz os fatos.
 *
 * A credencial vem sempre do ambiente. Nunca escreva uma chave em arquivo:
 * o plugin declara `linear_api_key` como `sensitive` no `userConfig`, e o
 * workflow usa um secret do repositório.
 */

const LINEAR_API = "https://api.linear.app/graphql";

/** Código de fase no padrão do corpus, ex.: "D07-PH-1400". */
const PHASE_CODE = /\b(D\d{2}-PH-\d{4})\b/;

export class MissingCredentialError extends Error {
  constructor(readonly variable: string) {
    super(
      `${variable} não está definida. O pipeline não inventa dados: defina a credencial ` +
        `ou rode com --source=fixture.`,
    );
    this.name = "MissingCredentialError";
  }
}

interface LinearIssueNode {
  identifier: string;
  title: string;
  dueDate: string | null;
  url: string;
  state: { name: string };
  labels: { nodes: { name: string }[] };
  parent: { identifier: string } | null;
  cycle: { name: string; number: number } | null;
  project: { name: string } | null;
}

const ISSUES_QUERY = `
  query WeekIssues($filter: IssueFilter!, $first: Int!) {
    issues(filter: $filter, first: $first) {
      nodes {
        identifier
        title
        dueDate
        url
        state { name }
        labels { nodes { name } }
        parent { identifier }
        cycle { name number }
        project { name }
      }
    }
  }
`;

async function queryLinear<T>(
  apiKey: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(LINEAR_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Linear respondeu ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) {
    throw new Error(`Linear: ${payload.errors.map((e) => e.message).join("; ")}`);
  }
  if (!payload.data) throw new Error("Linear devolveu resposta sem dados");
  return payload.data;
}

function toTask(node: LinearIssueNode): RawTask {
  return {
    id: node.identifier,
    title: node.title,
    dueDate: node.dueDate,
    status: node.state.name,
    labels: node.labels.nodes.map((label) => label.name),
    url: node.url,
    parentId: node.parent?.identifier,
  };
}

function toPhase(node: LinearIssueNode): RawPhase | null {
  const match = PHASE_CODE.exec(node.title);
  if (!match) return null;
  return {
    id: node.identifier,
    code: match[1],
    title: node.title,
    status: node.state.name,
    labels: node.labels.nodes.map((label) => label.name),
  };
}

export interface LinearCollectOptions {
  teamKey: string;
  /** Intervalo do sprint, ISO `YYYY-MM-DD`, ambos inclusivos. */
  from: string;
  to: string;
  sprintId: string;
  apiKey?: string;
}

/** Coleta a semana no Linear. Lança se a credencial não estiver presente. */
export async function collectFromLinear(options: LinearCollectOptions): Promise<RawWeek> {
  const apiKey = options.apiKey ?? process.env.LINEAR_API_KEY;
  if (!apiKey) throw new MissingCredentialError("LINEAR_API_KEY");

  // Tarefas da semana: as que têm data de entrega dentro do intervalo.
  const tasksData = await queryLinear<{ issues: { nodes: LinearIssueNode[] } }>(
    apiKey,
    ISSUES_QUERY,
    {
      first: 250,
      filter: {
        team: { key: { eq: options.teamKey } },
        dueDate: { gte: options.from, lte: options.to },
      },
    },
  );

  // Issues de fase: são as que dão nome às entregas (D07-PH-1400 etc.).
  const phasesData = await queryLinear<{ issues: { nodes: LinearIssueNode[] } }>(
    apiKey,
    ISSUES_QUERY,
    {
      first: 250,
      filter: {
        team: { key: { eq: options.teamKey } },
        title: { contains: "-PH-" },
      },
    },
  );

  const taskNodes = tasksData.issues.nodes;
  const cycleName = taskNodes.find((node) => node.cycle)?.cycle?.name;
  const projectName = taskNodes.find((node) => node.project)?.project?.name;

  return {
    sprintId: options.sprintId,
    from: options.from,
    to: options.to,
    cycleName,
    projectName,
    tasks: taskNodes.map(toTask),
    phases: phasesData.issues.nodes
      .map(toPhase)
      .filter((phase): phase is RawPhase => phase !== null),
    evidence: [],
    provenance: [
      `linear:team=${options.teamKey}`,
      `linear:dueDate=${options.from}..${options.to}`,
      ...(projectName ? [`linear:project=${projectName}`] : []),
    ],
  };
}
