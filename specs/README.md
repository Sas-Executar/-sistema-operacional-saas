---
name: specs-home
description: Índice de specs/ — motor de Spec-Driven Development (SDD) do repositório, instalado via @igoruehara/spec-driven.
alwaysApply: false
---

# `specs/` — Especificações executáveis

Esta pasta é o motor de Spec-Driven Development (SDD) do repositório, instalado via
`@igoruehara/spec-driven`. Cada funcionalidade relevante ganha uma pasta `NNNN-nome-da-feature/`
com a especificação que serve de contrato entre produto, arquitetura e implementação.

## Estrutura por feature

```text
specs/NNNN-nome-da-feature/
├── product.md   # por quê, para quem (liga a docs/produto/ e docs/clientes/)
├── domain.md    # linguagem ubíqua da feature
├── spec.md      # critérios de aceite (Given/When/Then) — fonte da verdade
├── design.md    # decisões arquiteturais da feature, quando aplicável
└── tasks.md     # decomposição em unidades executáveis, com rastreio aos ACs
```

- `_templates/` guarda os templates usados para gerar cada arquivo acima.
- `quick/` é para mudanças triviais que ainda querem deixar rastro, sem o aparato completo.
- `0001-exemplo-cota-de-uso/` é o exemplo gerado pelo scaffold — mantenha como referência de
  formato; não é uma funcionalidade real deste SaaS.

## Regra

Nenhuma funcionalidade relevante deve ser implementada sem uma pasta correspondente aqui, com
critérios de aceite claros. Ver `AGENTS.md` e `CLAUDE.md` para o fluxo completo.
