# AGENTS.md — Weekly Sprint Renderer

## Mission
Build and maintain a deterministic weekly sprint pipeline. Project sources are authoritative. Never invent facts, status, dates, owners, evidence, or deliverables.

## Source of truth
- `spec/normative.yaml`: design/content contract.
- `spec/sprint.schema.json`: structural validation.
- `data/*.source.yaml`: immutable source snapshots.
- `data/*.normalized.yaml`: renderer input.

## Required pipeline
1. Read source data and retain provenance IDs.
2. Normalize copy without changing factual meaning.
3. Enforce: objective/action <= 7 words; prefer 4. Deliverable <= 3 words; 1–3 per day.
4. Keep exactly 3 actions per day when source provides them.
5. If content cannot comply without changing meaning, fail validation. Do not silently truncate.
6. Render from normalized data only.
7. Use one HTML/CSS layout for browser preview and PDF.
8. Print geometry must use mm/pt, not screen px as the source of truth.
9. Add automated visual and schema tests before changing layout tokens.

## Architecture constraints
- React/Next.js is the preview/application shell, not the source of layout truth.
- CSS print rules own page geometry.
- Playwright renders the PDF from the same route used for preview.
- No canvas screenshot PDF; preserve vector text.
- Default target is office A4 landscape. Commercial PDF/X is a separate prepress step.

## Agent behavior
- Prefer deterministic transforms for formatting/validation.
- Use AI only for semantic compression, classification, and source synthesis.
- Every generated statement must retain evidence/provenance.
- Log validation failures and regeneration attempts.
