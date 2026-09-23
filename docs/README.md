---
name: project-home
description: Mapa do projeto — índice navegável com link para cada artefato (onde estamos, produto, arquitetura, engenharia, specs, glossário). Porta de entrada de docs/. Gerado/atualizado no /kickoff. Puxe quando precisar achar onde algo mora.
alwaysApply: false
---

# <Projeto> — Mapa do projeto

> **Porta de entrada da documentação.** Um índice de "onde está cada coisa" — não duplique
> conteúdo aqui, só **aponte** para o doc certo. Gerado/atualizado no `/kickoff` (Fase 5).
> Itens em `código` ainda não existem no boilerplate fresco: o `/kickoff` os gera e os
> transforma em link. Mantenha enxuto: seções têm nomes estáveis; só a lista de specs cresce.

**One-liner do produto:** <o que é, em uma frase> · **Status:** <discovery / MVP / em produção>

## 🧭 Onde estamos agora
- **Memória de trabalho** (onde paramos, próximo passo, bloqueios) → [operacao/estado.md](operacao/estado.md)
- **Aprendizados & gotchas** (staging volátil que se auto-poda) → [operacao/aprendizados.md](operacao/aprendizados.md)
- **Roadmap** (Now / Next / Later) → `produto/roadmap.md`

## 🧱 Corpus, estratégia, clientes, mercado e decisões
- **Corpus** (material bruto, não é verdade canônica por si só) → [corpus/README.md](corpus/README.md)
- **Estratégia** (visão, North Star, OKRs) → [estrategia/README.md](estrategia/README.md)
- **Clientes** (ICP, personas, pesquisa) → [clientes/README.md](clientes/README.md)
- **Mercado** (concorrência, posicionamento) → [mercado/README.md](mercado/README.md)
- **Decisões** (ADRs de produto/negócio, fora do ADR técnico) → [decisoes/README.md](decisoes/README.md)
- **Operação** (Linear, estado, aprendizados) → [operacao/README.md](operacao/README.md)

## 🎯 Produto — por quê e para quem
> Gerados no `/kickoff` greenfield. Em projeto que já roda, comece pelo assessment (em Arquitetura).
- **Visão & escopo** → `produto/visao.md`
- **Stakeholders** → `produto/partes-interessadas.md`
- **Jornadas** → `produto/jornadas.md`
- **Funcionalidades** (classificadas + sequenciadas) → `produto/funcionalidades.md`
- **MVP canvas** → `produto/mvp-canvas.md`

## 🏛️ Arquitetura — como, no nível de sistema
- **Overview** (os 5 eixos + segurança + operacional) → [arquitetura/visao-geral.md](arquitetura/visao-geral.md)
- **Context map** (bounded contexts e relações) → [arquitetura/mapa-de-contexto.md](arquitetura/mapa-de-contexto.md)
- **Diagramas** (Mermaid) → [arquitetura/diagramas.md](arquitetura/diagramas.md)
- **ADRs** (decisões duráveis e imutáveis) → [arquitetura/adr/](arquitetura/adr/)
- **Assessment as-is** (brownfield) → `arquitetura/assessment.md`

## 🛠️ Engenharia — como construímos
- **Testes e quality gates** → [arquitetura/engenharia/testes.md](arquitetura/engenharia/testes.md)
- **Camada agêntica** (rules, subagents, skills, workflows) → [arquitetura/engenharia/camada-agentica.md](arquitetura/engenharia/camada-agentica.md)
- **Integrações / MCPs** → `arquitetura/engenharia/integracoes.md`
- **Métricas de entrega** → [arquitetura/engenharia/metricas.md](arquitetura/engenharia/metricas.md)

## 📐 Specs — o contrato de cada feature
> A pasta [`specs/`](../specs/) é a fonte viva; a lista abaixo é mantida no `/kickoff`
> (atualize ao criar features com `/nova-feature`).
- [`specs/0001-exemplo-cota-de-uso/`](../specs/0001-exemplo-cota-de-uso/spec.md) — exemplo preenchido

## 📖 Linguagem & convenções
- **Glossário** (linguagem ubíqua) → [glossario.md](glossario.md)
- **Constituição p/ agentes de IA** → [../CLAUDE.md](../CLAUDE.md)
- **Manual da esteira SDD** (fluxo, tiers, DoR/DoD) → [../README.md](../README.md)
