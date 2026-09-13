---
name: adr-0001-bootstrap-sistema-operacional
description: ADR — decisões do bootstrap do sistema operacional (Spec Driven + PM Skills + Linear). Puxe ao entender por que a estrutura do repositório é como é.
alwaysApply: false
---

# ADR 0001 — Bootstrap do sistema operacional (Spec Driven + PM Skills + Linear)

- **Status:** Aceito
- **Data:** 2026-09-13

## Contexto

O repositório continha apenas `README.md` e `AGENTS.md`, definindo princípios (português do
Brasil, documentação antes da implementação, fonte única da verdade) e a estrutura de diretórios
prevista, combinando duas metodologias de referência: **Spec-Driven Development** (Igor Uehara)
e **PM Skills** (Lucas Garavelli). Era necessário instalar e adaptar essas referências em um
único sistema operacional coerente, sem duplicar metodologias paralelas.

## Decisão

1. **Instalar o motor Spec-Driven** via `npx @igoruehara/spec-driven . --agent=claude --yes`,
   que gerou `specs/`, `.claude/skills/`, `.claude/hooks/`, `CLAUDE.md`, `.spec-driven/manifest.json`
   e uma primeira versão de `docs/` (em inglês: `product/`, `architecture/`, `engineering/`).
2. **Reorganizar** o `docs/` gerado para a estrutura em português mandatada por `AGENTS.md`:
   - `docs/product/` → `docs/produto/`
   - `docs/architecture/` → `docs/arquitetura/`
   - `docs/engineering/` → `docs/arquitetura/engenharia/`
   - `docs/glossary.md` → `docs/glossario.md`, `docs/STATE.md` → `docs/operacao/estado.md`,
     `docs/lessons.md` → `docs/operacao/aprendizados.md`
   - todas as referências cruzadas (em `CLAUDE.md`, `.claude/skills/`, `.claude/hooks/`,
     `docs/README.md` e os próprios templates) foram atualizadas para os novos caminhos.
3. **Não copiar literalmente o PM Skills** (`lucasgaravelli/pm-skills-claude-code`, clonado
   temporariamente em `/tmp/pm-skills`, fora da árvore do repositório). Em vez de instalar seus
   24 comandos como uma segunda camada de skills paralela ao motor SDD, seu conteúdo foi
   **analisado e adaptado** para os 13 templates em português de `templates/`, mantendo o motor
   de skills único (`.claude/skills/`, gerado pelo Spec-Driven).
4. **Criar as pastas mandatadas** que ainda não existiam (`docs/estrategia/`, `docs/clientes/`,
   `docs/mercado/`, `docs/decisoes/`), cada uma com um `README.md` explicando seu propósito e
   relação com as demais.
5. **Documentar o Linear** em `docs/operacao/linear.md` (hierarquia, estados, rótulos,
   convenções), sem executar qualquer alteração real (não há credenciais configuradas).
6. **Não processar corpus real** — `docs/corpus/` permanece vazio; apenas as regras de
   tratamento foram documentadas em `docs/corpus/README.md`.

## Alternativas consideradas

- **Manter os comandos do PM Skills como skills separadas** (`.claude/commands/*` copiados) —
  rejeitado: criaria duas camadas de invocação (skills SDD vs. comandos PM Skills) para o mesmo
  tipo de tarefa, violando a regra de evitar metodologias paralelas/duplicadas.
- **Não instalar o Spec-Driven e criar a estrutura manualmente** — não foi necessário: o
  comando funcionou (rede disponível), então a estrutura oficial da ferramenta foi usada como
  base e adaptada, em vez de reconstruída à mão.
- **Manter os diretórios de docs em inglês** (como gerados) — rejeitado: viola a regra de
  português do Brasil obrigatória em `AGENTS.md`/`README.md`.

## Classificação das skills do PM Skills (Fase 3)

| Comando (PM Skills) | Classificação | Destino / observação |
|---|---|---|
| `discovery` | Adaptar | Coberto pelo fluxo de `docs/clientes/` + `templates/pesquisa-de-problema.md` |
| `opportunity-tree` | Adaptar | Técnica de discovery (Teresa Torres) — referenciada em `docs/clientes/README.md`, sem template dedicado (uso opcional dentro da pesquisa de problema) |
| `interview-synthesis` | Adaptar | → `templates/pesquisa-de-problema.md` |
| `ideal-customer-profile` | Incorporar | → `templates/icp.md` |
| `persona` | Adaptar | Coberto dentro de `templates/icp.md` (seção de comportamento/JTBD); persona dedicada fica a critério de quem preencher `docs/clientes/` |
| `customer-journey` | Adaptar | Referenciado em `docs/produto/README.md` (`jornadas.md`, gerado pelo motor SDD); não duplicado em `templates/` |
| `prd` | Incorporar | → `templates/prd.md` |
| `hypothesis` | Incorporar | → `templates/experimento.md` (seção Hipótese) |
| `experiment-design` | Incorporar | → `templates/experimento.md` |
| `acceptance-criteria` | Já coberta | O motor SDD (`specs/_templates/spec.template.md`) já define critérios de aceite em Given/When/Then como fonte da verdade — não duplicar |
| `user-stories` | Já coberta | Sobreposto por `specs/` (critérios de aceite + tasks) — evita metodologia paralela |
| `prioritize` (RICE) | Adaptar | Técnica de priorização referenciada em `docs/produto/README.md`; sem template dedicado — usar ao priorizar `docs/produto/roadmap.md` e o backlog no Linear |
| `roadmap` | Incorporar | Coberto por `docs/produto/roadmap.md` (gerado pelo motor SDD); `templates/` não duplica |
| `okr` | Adaptar | Referenciado em `docs/estrategia/README.md` (OKRs vigentes); sem template dedicado nesta fase |
| `north-star` | Adaptar | Referenciado em `docs/estrategia/README.md` e `templates/visao-do-produto.md` |
| `measure-pmf` | Adaptar | Técnica referenciada em `templates/revisao-pos-lancamento.md` |
| `ab-test-analysis` | Incorporar | → `templates/revisao-pos-lancamento.md` |
| `launch-checklist` | Incorporar | → `templates/lancamento.md` |
| `gtm` | Incorporar | → `templates/lancamento.md` (seção de estratégia GTM) |
| `pre-mortem` | Incorporar | → `templates/lancamento.md` (seção Pré-mortem) |
| `release-notes` | Desnecessária (por agora) | Não há produto/lançamento real a documentar; formato pode ser adicionado quando houver o primeiro lançamento real |
| `stakeholder-update` | Incorporar | → `templates/status-de-projeto.md` |
| `competitive-analysis` | Adaptar | Referenciado em `docs/mercado/README.md`; sem template dedicado nesta fase |
| `battlecard` | Desnecessária (por agora) | Depende de produto/vendas ativos, que não existem ainda neste corpus |
| `pricing` | Desnecessária (por agora) | Depende de modelo de negócio definido, ainda não documentado |
| `strategy` (canvas) | Já coberta | Sobreposto por `templates/visao-do-produto.md` + `docs/estrategia/README.md` — evita canvas paralelo |
| `lean-canvas` | Já coberta | Mesmo motivo — visão + PRD já cobrem o conteúdo, sem introduzir um segundo canvas |

## Consequências

- Existe uma única estrutura de documentação e um único motor de skills (`.claude/skills/`),
  com os templates de PM em `templates/` servindo de conteúdo de referência para preencher os
  documentos de `docs/`, não como um segundo sistema de comandos.
- `docs/corpus/` continua vazio — nenhuma informação de produto/negócio foi inventada.
- `src/` (gerado pelo scaffold) contém apenas uma regra de camadas DDD agnóstica de
  linguagem/stack, sem nenhuma funcionalidade de produto implementada.

## Riscos

- O motor SDD gerado tem convenções próprias (`alwaysApply`, tiers, orçamento de contexto) que
  precisam continuar sendo respeitadas por quem editar `docs/` e `specs/` manualmente — risco de
  divergência se alguém adicionar documentos fora do padrão de frontmatter.
- Templates adaptados do PM Skills são traduções/simplificações; nuances dos frameworks originais
  (RICE, OST, Sean Ellis Test, etc.) não foram copiadas linha a linha — quem usar os templates
  para uma técnica específica deve buscar a referência original se precisar de profundidade.

## Rastreabilidade

- PR desta mudança: ver descrição do Pull Request.
- Estrutura resultante: ver árvore de arquivos na descrição do Pull Request.
