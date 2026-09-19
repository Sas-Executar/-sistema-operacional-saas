# ADR-001 — Renderizador de sprint semanal

- **Status:** Aceito
- **Data:** 2026-09-14
- **Escopo:** `weekly-sprint/`

## Contexto

O handoff `weekly-sprint-handoff` entregou um contrato de conteúdo e design (`spec/normative.yaml`), um schema estrutural (`spec/sprint.schema.json`) e uma semana normalizada real (`data/SEMANA_01.normalized.yaml`), sem implementação.

O objetivo é transformar evidência de projeto (Linear, GitHub) numa folha A4 paisagem que renderize identicamente em navegador e PDF, com geometria em unidades físicas e validação que falha alto em vez de truncar.

Duas restrições do contrato governam o desenho:

- `overflow.font_shrink: false` e `overflow.truncate: false` — não é permitido encolher nem cortar texto para caber.
- `content_contract.no_inference: true` e `provenance_required: true` — nada pode ser inventado, e toda afirmação retém referência de origem.

## Decisão

**1. A geometria é do CSS, não do React.** React/Next.js é a casca de preview e componentização. `@page`, `mm` e `pt` são a autoridade do layout. O mesmo HTML gera preview e PDF, o que elimina a divergência entre dois layouts.

**2. A semana é um calendário fixo de 7 colunas.** `grid.supported_day_count` passa de `[5, 6]` para `[7]`; o schema passa de `days.minItems 5 / maxItems 6` para `minItems 1 / maxItems 7`.

A contagem de colunas deixa de ser derivada dos dados e passa a ser moldura de calendário. `days[]` carrega apenas dias com conteúdo real, cada um validado integralmente; o renderizador mapeia cada dia ao seu slot pelo prefixo do rótulo (SEG=1 … DOM=7) e deixa os slots restantes em branco.

Isso separa geometria de dados: os brancos são layout, não conteúdo ausente disfarçado. A `SEMANA_01` tem 6 dias reais (SEG 14 → SÁB 19) e renderiza o slot de DOM 20 vazio, sem inventar um domingo.

**3. A IA propõe, o validador decide.** O agente nunca escreve o YAML normalizado em disco. Ele chama a ferramenta `propose_sprint`, cujo schema é o próprio `sprint.schema.json`; o código valida e, em caso de falha, devolve os erros ao agente para regeneração. É o `overflow.failure_policy: reject_and_regenerate` implementado como loop, e garante que nenhuma violação de contrato alcance a folha.

**4. Extensões declaradas em vez de inferência silenciosa.** `next_week.label`, `next_week.risks` e `compliance.exceptions` existem no fixture mas não no `content_contract` 1.1.0. Passam a ser limitados a 7 palavras por analogia a `next_week.max_words_each`, com a regra **escrita no `normative.yaml`** e marcada `declared_extension: true`. A alternativa — aplicar o limite em código sem registrá-lo no contrato — seria exatamente a inferência silenciosa que o spec proíbe.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| Grade variável de 5–8 colunas | 8 colunas dá 29,75mm/coluna; o token "institucionais" a 11pt mede ~29,9mm e estouraria. 7 colunas (34,71mm) é o limite seguro medido. |
| Dias vazios como itens de `days[]` | Exigiria relaxar `actions: exatamente 3` para aceitar dias sem ações, enfraquecendo a validação do conteúdo real. |
| Agente escrevendo o YAML direto | Sem o gate do validador, uma violação de limite de palavras chegaria à folha sem ser detectada. |
| PDF por screenshot/canvas | Perde texto vetorial e seletividade; contraria `print.vector_first: true`. |

## Consequências

- O contrato deixa de suportar semanas de 5 ou 6 colunas como moldura; semanas com menos dias preenchidos continuam funcionando, agora como brancos de calendário.
- O `sprint.schema.json` fica mais permissivo em `minItems` (1 em vez de 5). A cobertura perdida é reposta pelos validadores explícitos, que continuam exigindo 3 ações e `ref` por ação em todo dia presente.
- Preview e PDF compartilham uma única fonte de geometria; mudar um token de layout muda ambos.
- O gate de estouro (Playwright, `scrollHeight`/`scrollWidth`) passa a ser critério de aceite: conteúdo que não cabe falha o build em vez de ser encolhido.

## Riscos

- **Fonte não nomeada:** `typography.family_role` diz apenas `licensed_neutral_sans`. A escolha (Inter, self-hosted via `@fontsource`) é nossa e afeta a métrica de largura. Trocar a família exige rodar o gate de estouro de novo.
- **Papéis tipográficos ausentes:** o spec não define tamanho para `week_goal`, `objective`, `note`, `review` e `next_week`. Foram mapeados ao papel definido mais próximo e documentados em `src/lib/tokens.ts`.
- **Credencial do Linear:** o runner agendado depende de `LINEAR_API_KEY`, que não existe no ambiente atual. Sem ela o pipeline roda apenas em modo fixture.
