---
name: templates-home
description: Índice de templates/ — modelos de documento em português, prontos para copiar e preencher.
alwaysApply: false
---

# `templates/` — Modelos de documento

Templates em português, prontos para copiar e preencher. Complementam (não substituem) os
templates internos do motor SDD em `specs/_templates/` e `docs/*/_templates/` — estes aqui são
para os documentos de produto/estratégia/operação que ficam em `docs/` e `docs/decisoes/`, e para
os tipos de issue usados no Linear.

## Lista

| Template | Uso | Onde vira documento |
|---|---|---|
| `visao-do-produto.md` | Visão de produto | `docs/produto/visao.md` |
| `icp.md` | Perfil de Cliente Ideal | `docs/clientes/` |
| `pesquisa-de-problema.md` | Síntese de pesquisa/discovery | `docs/clientes/` ou `docs/mercado/` |
| `prd.md` | Requisitos de uma iniciativa | `docs/produto/` |
| `funcionalidade.md` | Registro de funcionalidade | `docs/produto/funcionalidades.md` |
| `experimento.md` | Hipótese + desenho de experimento | `docs/produto/` |
| `especificacao-tecnica.md` | Referência rápida de spec (o motor completo é `specs/`) | `specs/<NNNN>/spec.md` |
| `adr.md` | Decisão arquitetural ou de produto/negócio | `docs/arquitetura/adr/` ou `docs/decisoes/` |
| `defeito.md` | Registro de bug | issue Linear (rótulo Defeito) |
| `divida-tecnica.md` | Registro de dívida técnica | issue Linear (rótulo Dívida técnica) |
| `lancamento.md` | Plano de lançamento / GTM | `docs/produto/` ou Marco no Linear |
| `revisao-pos-lancamento.md` | Análise de resultado pós-lançamento | `docs/produto/` |
| `status-de-projeto.md` | Update executivo de projeto | comentário/documento no Linear |

## Origem

Estes templates foram adaptados para português e para a arquitetura combinada deste repositório
a partir de duas fontes, evitando estruturas paralelas (ver `docs/decisoes/` para o registro
completo da decisão de consolidação):

- **Spec-Driven** (`@igoruehara/spec-driven`) — para `especificacao-tecnica.md` e `adr.md`
  (técnico), que apontam para o motor real em `specs/` e `docs/arquitetura/adr/`.
- **PM Skills** (`lucasgaravelli/pm-skills-claude-code`) — para os demais, adaptados e
  simplificados a partir dos comandos de discovery, ICP, PRD, hipótese, priorização, roadmap,
  lançamento e pós-lançamento.
