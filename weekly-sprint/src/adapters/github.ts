import type { RawEvidence } from "./types";

/**
 * Adaptador do GitHub.
 *
 * Papel estreito e deliberado: achar onde as referências do Linear aparecem em
 * commits e pull requests. Isso transforma "a tarefa existe" em "a tarefa tem
 * evidência de execução", que é o que `evidence_ref` significa nas entregas.
 *
 * Não inventa ligação: só reporta citações textuais de um identificador.
 */

const GITHUB_API = "https://api.github.com";

/** Identificadores do corpus, ex.: "EXE-59", "D07-PH-1400". */
const REF_PATTERN = /\b(?:[A-Z]{2,5}-\d{1,5}|D\d{2}-(?:PH|TASK|DOC)-[\dA-Z-]+)\b/g;

export interface GitHubCollectOptions {
  owner: string;
  repo: string;
  /** Janela de busca, ISO 8601. */
  since: string;
  until: string;
  token?: string;
}

interface CommitNode {
  sha: string;
  html_url: string;
  commit: { message: string };
}

interface PullNode {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  merged_at: string | null;
}

async function githubGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub respondeu ${response.status} em ${path}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

function extractRefs(text: string): string[] {
  return Array.from(new Set(text.match(REF_PATTERN) ?? []));
}

/**
 * Busca evidências no repositório. Sem token, devolve lista vazia em vez de
 * falhar: a evidência do GitHub é complementar, e a ausência dela não pode
 * impedir a folha de ser gerada a partir do Linear.
 */
export async function collectFromGitHub(
  options: GitHubCollectOptions,
): Promise<{ evidence: RawEvidence[]; provenance: string[] }> {
  const token = options.token ?? process.env.GITHUB_TOKEN;
  if (!token) return { evidence: [], provenance: ["github:sem-token"] };

  const { owner, repo, since, until } = options;
  const evidence: RawEvidence[] = [];

  const commits = await githubGet<CommitNode[]>(
    `/repos/${owner}/${repo}/commits?since=${since}&until=${until}&per_page=100`,
    token,
  );
  for (const commit of commits) {
    for (const ref of extractRefs(commit.commit.message)) {
      evidence.push({
        ref,
        kind: "commit",
        identifier: commit.sha.slice(0, 7),
        url: commit.html_url,
      });
    }
  }

  const pulls = await githubGet<PullNode[]>(
    `/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
    token,
  );
  for (const pull of pulls) {
    // Só PRs mesclados na janela contam como evidência de entrega.
    if (!pull.merged_at || pull.merged_at < since || pull.merged_at > until) continue;
    for (const ref of extractRefs(`${pull.title}\n${pull.body ?? ""}`)) {
      evidence.push({
        ref,
        kind: "pull_request",
        identifier: `#${pull.number}`,
        url: pull.html_url,
      });
    }
  }

  return {
    evidence,
    provenance: [`github:${owner}/${repo}`, `github:janela=${since}..${until}`],
  };
}
