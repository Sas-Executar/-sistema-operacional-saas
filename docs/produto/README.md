---
name: produto-home
description: Índice de docs/produto/ — visão, roadmap, funcionalidades, jornadas e PRDs do produto.
alwaysApply: false
---

# `docs/produto/` — Produto

Documentação de produto: visão, proposta de valor, roadmap, funcionalidades (existentes e
planejadas), jornadas de usuário, PRDs e MVP canvas.

## Documentos principais (gerados sob demanda, ver `_templates/`)

- `visao.md` — visão e escopo do produto.
- `roadmap.md` — Now / Next / Later.
- `funcionalidades.md` — funcionalidades classificadas e sequenciadas.
- `jornadas.md` — jornadas de usuário relevantes.
- `partes-interessadas.md` — stakeholders do produto.
- `mvp-canvas.md` — canvas de MVP.
- PRDs individuais de cada iniciativa relevante (usar `templates/prd.md`).

## Relação com outras pastas

- ICP e personas moram em `docs/clientes/`, não aqui — este diretório referencia-os, não os
  duplica.
- Prioridade de topo (North Star, OKRs) vem de `docs/estrategia/`.
- Especificação técnica de cada funcionalidade vive em `specs/`, não aqui.

## Regra

Nenhuma funcionalidade relevante deve ser implementada sem uma especificação correspondente em
`specs/` (ver `AGENTS.md` e `CLAUDE.md`). Este diretório documenta o *quê* e o *porquê*; `specs/`
documenta o *como* de forma testável.
