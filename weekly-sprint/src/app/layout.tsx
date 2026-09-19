import type { Metadata } from "next";
import type { ReactNode } from "react";

// Fonte auto-hospedada. O contrato pede `licensed_neutral_sans` sem nomear
// família; Inter é a escolha registrada no ADR-001. Auto-hospedar importa para
// o PDF: garante que a mesma métrica seja usada no preview e na exportação, e
// que a fonte seja embutida (`print.fonts_embedded: true`).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import "../styles/print.css";

export const metadata: Metadata = {
  title: "Sprint operacional semanal",
  description: "Folha A4 paisagem gerada a partir do YAML normalizado.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={
          {
            "--font-sheet": "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
