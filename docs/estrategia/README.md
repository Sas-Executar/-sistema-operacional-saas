---
name: estrategia-home
description: Índice de docs/estrategia/ — visão de longo prazo, North Star, OKRs e apostas estratégicas.
alwaysApply: false
---

# `docs/estrategia/` — Estratégia

Documentação de nível estratégico: visão de longo prazo, North Star, OKRs, apostas e
posicionamento. É o nível acima do produto (que trata de funcionalidades e execução) e serve
como critério de priorização para tudo o que entra em `docs/produto/` e no Linear.

## O que vai aqui

- Visão de longo prazo e North Star Metric.
- OKRs vigentes e histórico de OKRs anteriores.
- Apostas estratégicas (bets) e teses de crescimento.
- Restrições estratégicas relevantes (mercado, regulatório, recursos).

## O que não vai aqui

- Detalhe de funcionalidade → `docs/produto/`.
- ICP, personas e pesquisa com clientes → `docs/clientes/`.
- Análise de concorrência e mercado → `docs/mercado/`.
- Decisões técnicas → `docs/arquitetura/adr/`.

## Regras

- Toda afirmação de estratégia com origem em `docs/corpus/` deve manter o rótulo de confiança
  (`Confirmado` / `Inferido` / `Hipótese` / `Não definido` / `Conflitante`) definido em
  `docs/corpus/README.md` até ser explicitamente confirmada.
- Mudança relevante de estratégia (novo North Star, novo OKR de topo) deve ser registrada como
  decisão em `docs/decisoes/`.
