# HANDOFF — Weekly Operational Sprint

## Goal
Turn project evidence into a compact weekly sprint, validate it against a fixed content/design contract, preview it in-browser, and generate a print-ready office PDF.

## Recommended implementation
Use a small TypeScript monorepo/app:

- **Ingestion layer:** adapters for project sources (Linear/GitHub/files later).
- **Agent layer:** source synthesis + semantic compression only.
- **Contract layer:** JSON Schema + explicit word-count validators.
- **Renderer:** React component with print-first CSS using mm/pt.
- **PDF:** Playwright/Chromium from the same rendered page.
- **Scheduler:** weekly trigger invokes ingestion → normalization → validation → PDF.

React is recommended for preview and maintainability, but it is not required for PDF correctness. The PDF should come from semantic HTML/CSS, not from an image export.

## Build order for Codex
1. Scaffold TypeScript + Next.js app and tests.
2. Implement loader for `data/SEMANA_01.normalized.yaml`.
3. Implement schema + word-limit validation.
4. Build `SprintSheet` component and print CSS from `spec/normative.yaml`.
5. Add `/preview/[sprintId]` and PDF generation using Playwright.
6. Add snapshot/visual regression tests at 100% and 85% scale.
7. Add normalization service with AI structured output and provenance retention.
8. Only then connect live project sources and scheduling.

## Definition of done
- Same normalized payload renders identically in preview and PDF.
- 5- and 6-day weeks render without font shrinking.
- No action exceeds 7 words; no deliverable exceeds 3 words.
- Every action keeps a source reference.
- Grayscale print is legible on ordinary sulfite paper.
- Invalid or unsupported source content fails loudly instead of being invented.
