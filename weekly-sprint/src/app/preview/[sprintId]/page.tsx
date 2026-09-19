import { notFound } from "next/navigation";
import { SprintSheet } from "../../../components/SprintSheet";
import { loadSprint } from "../../../lib/loader";
import { SprintValidationError, formatValidation } from "../../../lib/validators";

/**
 * Rota única de renderização.
 *
 * O navegador e o Playwright consomem exatamente esta rota — é o que garante
 * que preview e PDF não divirjam. Renderiza no servidor, lendo o YAML já
 * validado; nenhuma fonte viva é consultada aqui.
 */

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sprintId: string }>;
}

export default async function PreviewPage({ params }: PageProps) {
  const { sprintId } = await params;

  try {
    const sprint = loadSprint(sprintId);
    return <SprintSheet sprint={sprint} />;
  } catch (error) {
    if (error instanceof SprintValidationError) {
      // Falha alto e legível. O contrato manda rejeitar, não renderizar pela
      // metade: uma folha impressa com conteúdo inválido é pior que nenhuma.
      return (
        <main style={{ padding: "12mm", fontFamily: "var(--font-sheet)" }}>
          <h1 style={{ fontSize: "14pt" }}>Sprint reprovado na validação</h1>
          <p style={{ fontSize: "10pt" }}>{error.message}</p>
          <pre style={{ fontSize: "9pt", whiteSpace: "pre-wrap" }}>
            {formatValidation({
              valid: false,
              errors: error.result.errors,
              warnings: error.result.warnings,
              schemaValid: error.schemaErrors.length === 0,
              schemaErrors: error.schemaErrors,
            })}
          </pre>
        </main>
      );
    }
    notFound();
  }
}
