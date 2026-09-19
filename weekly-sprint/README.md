# Sprint operacional semanal

Transforma evidência de projeto (Linear, GitHub) numa folha A4 paisagem,
impressa em PDF vetorial, sob um contrato de conteúdo que falha alto em vez de
truncar.

## Princípio

**A IA decide linguagem. O código decide contrato e geometria.**

O agente comprime títulos de issues dentro dos limites de palavra. Ele nunca
escreve o YAML em disco: sua única saída é a ferramenta `propose_sprint`, que
valida antes de gravar. Proposta reprovada volta com a lista de campos a
corrigir. Geometria é do CSS em `mm`/`pt`; React só monta a árvore.

```
Linear ─┐
GitHub ─┤ coleta determinística, com procedência
        ↓
   fatos por dia
        ↓ compressão semântica (única etapa de IA)
  propose_sprint  ──reprova──→ erros voltam ao agente → regenera
        ↓ aprova
  SEMANA_NN.normalized.yaml
        ↓
  /preview/[sprintId]  ──Playwright──→ PDF vetorial
```

## Uso

```bash
npm install

# Pipeline determinístico (sem IA, sem credencial)
npm run sprint:week -- collect --source=fixture
npm run sprint:week -- validate --sprint=SEMANA_01
npm run sprint:week -- status

# Normalização com o agente (exige ANTHROPIC_API_KEY)
npm run agent:week -- --source=fixture --dry-run

# Preview e PDF
npm run build && npm run export:pdf     # → out/SEMANA_01.pdf
npm run dev                             # → http://localhost:3210/preview/SEMANA_01

# Verificação
npm test          # 75 testes de contrato
npm run test:e2e  # gate de estouro + seletibilidade do PDF
```

## Fontes de dados

| Modo | Origem | Credencial |
|---|---|---|
| `--source=fixture` | `tests/fixtures/linear.recorded.json` (gravado do Linear real) | nenhuma |
| `--source=linear` | API do Linear ao vivo | `LINEAR_API_KEY` |

O modo fixture existe para que o pipeline inteiro seja verificável sem rede e
sem segredo. Ele usa dados reais gravados, não sintéticos.

## Credenciais

Nunca em arquivo. Três caminhos, conforme onde roda:

| Onde | Como |
|---|---|
| Local | variáveis de ambiente `LINEAR_API_KEY`, `GITHUB_TOKEN`, `ANTHROPIC_API_KEY` |
| Plugin | `userConfig.linear_api_key`, marcado `sensitive` em `plugin/.claude-plugin/plugin.json` |
| CI | secrets do repositório, referenciados em `.github/workflows/sprint-semanal.yml` |

## Estrutura

```
spec/        contrato normativo e JSON Schema — a autoridade
data/        YAML de origem (imutável) e normalizado (entrada do renderer)
src/lib/     núcleo determinístico: palavras, schema, validadores, calendário, tokens
src/adapters/ Linear e GitHub
src/pipeline/ coleta, fatos por dia, CLI
src/app/     rota de preview do Next.js
agent/       runner do Agent SDK e o portão propose_sprint
plugin/      plugin do Claude Code: skill, subagente, hooks, conectores
tests/       unidade (Vitest) e e2e (Playwright)
```

## O que o gate de estouro garante

`overflow.font_shrink: false` e `truncate: false` significam que conteúdo grande
demais não pode ser encolhido nem cortado. Sem verificação, a única saída seria
vazar por cima do resto — defeito invisível numa folha impressa.

`tests/e2e/layout.spec.ts` mede a página renderizada e reprova o build se algo
ultrapassar a margem, se uma coluna invadir o rodapé, se um texto exceder a
largura da coluna, ou se alguma fonte cair abaixo de `min_text_pt`.

Com os tamanhos fixos do contrato, a SEMANA_01 ocupa 523pt dos 527pt
disponíveis. A folga é de ~4pt: mudanças de tipografia ou espaçamento precisam
rodar o gate de novo.

## Onde a semana é um calendário

A grade tem **sempre 7 colunas**. `days[]` carrega só os dias com conteúdo, cada
um validado integralmente; o renderer os posiciona pelo prefixo do rótulo
(`SEG`→1 … `DOM`→7) e deixa o resto em branco.

A SEMANA_01 tem 6 dias reais (SEG 14 → SÁB 19) e renderiza o domingo vazio.
Nenhum dado é inventado para preencher a grade.
