---
name: sprint-semanal
description: Gera a folha A4 do sprint operacional da semana a partir do Linear e do GitHub. Use quando pedirem para montar, atualizar, fechar ou imprimir o sprint semanal, o relatório da semana ou a folha de execução.
model: opus
effort: high
maxTurns: 20
---

# Sprint operacional semanal

Transforma evidência de projeto numa folha A4 paisagem impressa em PDF vetorial.

## O que este fluxo garante

A IA decide **linguagem**. O código decide **contrato e geometria**. Você
comprime texto sob limites de palavra; validadores determinísticos decidem se o
resultado é aceitável, e o CSS decide onde cada coisa cai na página.

Você não escreve o YAML em disco. Sua única saída é a ferramenta
`propose_sprint`, que valida antes de gravar. Uma proposta reprovada volta com a
lista exata de campos a corrigir.

## Passos

1. **Colete** as issues da semana no Linear: filtre por time e por `dueDate`
   dentro do intervalo. Traga também as issues de fase (`D..-PH-....`), que são
   a origem das entregas.
2. **Busque evidência** no GitHub: commits e PRs mesclados que citem os
   identificadores das issues. Evidência é opcional; sua ausência não bloqueia.
3. **Comprima** cada título ao limite de palavras, preservando verbo, objeto e
   resultado. Mantenha o `ref` da issue em toda ação.
4. **Chame `propose_sprint`**. Se reprovar, corrija só o que foi apontado.
5. **Gere o PDF** com `npm run export:pdf`.

## Limites de palavras

| Campo | Máximo | Preferido |
|---|---|---|
| `week_goal` | 7 | 4 |
| `objective` | 7 | 4 |
| `actions[].text` | 7 | 4 |
| `deliverables[].text` | 3 | 2 |
| `note` | 7 | 4 |
| `review.*` | 7 por campo | — |
| `next_week.priorities[]` | 7 cada, exatamente 3 | — |

Identificadores ligados por hífen ou barra contam como **uma** palavra:
`D07-PH-1400` = 1, `EXE-74/75` = 1.

## Regras que não se negociam

- **Não invente nada.** Sem data de entrega, a tarefa não entra em coluna
  nenhuma — reporte-a, não a posicione.
- **Toda ação carrega `ref`.** É o que liga a folha impressa à evidência.
- **Exatamente 3 ações por dia.**
- **Para caber, comprima a expressão — nunca remova o resultado.** Se o limite
  só puder ser atendido mudando o sentido, falhe e diga por quê.
- **Pendências vão para `compliance.exceptions`**, não para inferência.

## Como comprimir bem

O título vem assim da fonte:

```
D12-TASK-140010 — Inventariar nomes de variáveis por app e pacote
```

O prefixo de código é ruído para a folha; o `ref` já carrega a procedência.
Restam 8 palavras, uma acima do limite. Remova o modificador que não muda o
resultado:

```
Inventariar variáveis por app e pacote     (6 palavras, ref EXE-61)
```

"nomes de" caiu porque inventariar variáveis já implica inventariar seus nomes.
O que **não** pode cair: "por app e pacote" — é o escopo, e sem ele a ação vira
outra coisa.
