---
name: linear
description: Espelhamento operacional do Linear — hierarquia, estados, rótulos e convenções em português. Puxe antes de criar/organizar issues no Linear.
alwaysApply: false
---

# Linear — Espelhamento operacional

> Documentação apenas. Nenhuma alteração real foi feita no Linear — não há credenciais
> configuradas nesta tarefa. Este documento define como o Linear deve ser estruturado quando for
> configurado, para refletir a arquitetura deste repositório.

## Hierarquia

```text
Objetivo estratégico   → Iniciativa
Grande entrega          → Projeto
Etapa relevante do projeto → Marco
Unidade de trabalho      → Issue
Implementação granular   → Sub-issue
Período de execução       → Ciclo
```

- **Iniciativa** — corresponde a um objetivo de `docs/estrategia/` (North Star, OKR de topo).
- **Projeto** — corresponde a uma funcionalidade/entrega relevante, geralmente com um PRD em
  `docs/produto/` e uma pasta em `specs/`.
- **Marco** — etapa dentro do projeto (ex.: "MVP validado", "Lançamento geral").
- **Issue** — unidade de trabalho executável, idealmente rastreável a um critério de aceitação
  (`AC-N`) de `specs/<NNNN>/spec.md`.
- **Sub-issue** — divisão granular de uma issue grande.
- **Ciclo** — janela de tempo de execução (sprint), usada para planejamento de capacidade.

## Estados

### Estados de Projeto

```text
Ideia
Em descoberta
Planejado
Em execução
Em validação
Lançado
Concluído
Cancelado
```

### Estados de Issue

```text
Triagem
Aguardando
Planejado
Em andamento
Em revisão
Em validação
Concluído
Cancelado
```

Regras de transição:

- Uma issue só entra em **Em andamento** se tiver uma especificação (ou tarefa de `specs/`)
  vinculada, quando aplicável (funcionalidades relevantes) — ver `AGENTS.md`.
- **Em validação** é usado quando o código foi entregue mas a validação (testes, métricas,
  aceite do usuário) ainda está em andamento — não pular direto para Concluído.
- **Cancelado** exige um motivo curto no comentário da issue, para rastreabilidade.

## Rótulos

Grupos consistentes, sem redundância entre grupos:

- **Tipo:** `Funcionalidade`, `Melhoria`, `Defeito`, `Dívida técnica`, `Pesquisa`, `Experimento`.
- **Impacto:** `Crítico`, `Alto`, `Médio`, `Baixo`.
- **Origem:** `Cliente`, `Equipe`, `Dados`, `Suporte`, `Estratégia`.

Não criar novos rótulos fora desses grupos sem necessidade clara — evita fragmentação da
taxonomia. Se um novo rótulo parecer necessário, registrar a justificativa em
`docs/decisoes/`.

## Convenções de nomenclatura

- Nomes de Iniciativa, Projeto, Marco, Issue e Sub-issue em **português do Brasil**.
- Títulos de issue no imperativo, curtos e específicos (ex.: "Adicionar validação de e-mail no
  cadastro", não "Cadastro").
- Toda issue relevante deve linkar, na descrição, para o documento de origem: PRD
  (`docs/produto/`), spec (`specs/<NNNN>/spec.md`) ou ADR (`docs/arquitetura/adr/` /
  `docs/decisoes/`), mantendo rastreabilidade entre decisão e implementação.
- Documentos do Linear (quando usados) devem seguir os templates de `templates/` traduzidos para
  português.

## Ciclos

- Ciclo representa capacidade de execução, não escopo fixo — evitar prometer todo o backlog de
  um Projeto em um único Ciclo.
- Ao fechar um Ciclo, issues não concluídas voltam para o próximo Ciclo ou para
  **Planejado**, nunca ficam "perdidas" sem estado.

## O que este documento não faz

- Não cria, edita nem sincroniza nada no Linear de fato (sem credenciais/API neste momento).
- Não substitui `specs/` como fonte de critérios de aceite — o Linear referencia `specs/`, não
  duplica seu conteúdo.
