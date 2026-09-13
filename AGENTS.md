# AGENTS.md

## Objetivo

Este repositório é a fonte canônica de estratégia, produto, arquitetura, especificações e execução do SaaS.

Todo agente de IA deve preservar coerência entre:

`Corpus → Conhecimento canônico → Produto → Especificação → Linear → Código → Validação`

## Idioma obrigatório

Todo conteúdo não técnico deve ser produzido em **português do Brasil**.

Isso inclui documentação, iniciativas, projetos, marcos, issues, subtarefas, estados, rótulos, critérios de aceitação, relatórios, decisões, comentários operacionais e templates.

Utilize inglês somente quando necessário para código, APIs, bibliotecas, comandos, protocolos, nomes oficiais externos e identificadores técnicos.

Nunca traduza identificadores de código apenas para cumprir esta regra.

## Princípio fundamental

Não iniciar implementação relevante antes de existir contexto suficiente e especificação adequada.

Fluxo padrão:

```text
Problema
↓
Evidências
↓
Contexto
↓
Hipótese ou requisito
↓
Especificação
↓
Planejamento
↓
Implementação
↓
Validação
↓
Aprendizado
```

## Fontes de conhecimento

### Corpus

Local padrão:

```text
docs/corpus/
```

O corpus contém material bruto e pode incluir documentos antigos, pesquisas, reuniões, anotações, requisitos, referências, apresentações e decisões históricas.

O corpus **não é automaticamente verdade canônica**.

Antes de utilizar uma afirmação do corpus:

1. identificar sua origem;
2. verificar versões conflitantes;
3. verificar se a informação continua válida;
4. consolidá-la na documentação canônica.

### Documentação canônica

Organização preferencial:

```text
docs/
├── estrategia/
├── produto/
├── clientes/
├── mercado/
├── arquitetura/
├── decisoes/
└── operacao/
```

Quando houver conflito entre corpus e documentação canônica, sinalizar a inconsistência antes de alterar decisões importantes.

## Primeira tarefa ao receber novo corpus

Antes de produzir código, analisar o material e gerar ou atualizar:

- visão do produto;
- proposta de valor;
- público-alvo;
- ICP;
- personas relevantes;
- problemas principais;
- jornadas;
- capacidades do produto;
- domínios funcionais;
- funcionalidades existentes;
- funcionalidades planejadas;
- regras de negócio;
- integrações;
- restrições técnicas;
- métricas;
- riscos;
- decisões existentes;
- dúvidas abertas;
- contradições documentais.

Não inventar informação para preencher lacunas.

Classificar afirmações relevantes como:

```text
Confirmado
Inferido
Hipótese
Não definido
Conflitante
```

## Gestão de produto

As práticas devem combinar:

- descoberta de problemas;
- evidências qualitativas e quantitativas;
- definição de ICP;
- resultados desejados;
- priorização;
- PRDs;
- hipóteses;
- experimentação;
- métricas;
- lançamento;
- análise pós-lançamento.

Priorizar resultados de produto sobre quantidade de funcionalidades.

## Especificações

Toda funcionalidade relevante deve possuir especificação antes da implementação.

Uma especificação deve conter, quando aplicável:

```text
# Contexto
# Problema
# Objetivo
# Fora de escopo
# Usuários afetados
# Requisitos funcionais
# Requisitos não funcionais
# Regras de negócio
# Fluxos
# Casos de borda
# Critérios de aceitação
# Métricas de sucesso
# Dependências
# Riscos
# Decisões técnicas
# Plano de validação
```

## Arquitetura

Mudanças arquiteturais significativas devem ser documentadas em ADR quando envolverem escolha tecnológica relevante, mudança estrutural, integração crítica, banco de dados, contratos, autenticação ou decisão difícil de reverter.

Formato recomendado:

```text
Contexto
Decisão
Alternativas consideradas
Consequências
Riscos
```

## Execução

Antes de implementar:

1. identificar a especificação;
2. confirmar critérios de aceitação;
3. identificar dependências;
4. verificar decisões arquiteturais;
5. dividir a entrega em unidades pequenas;
6. definir validações necessárias.

Preferir mudanças pequenas, verificáveis e reversíveis. Não ampliar escopo silenciosamente.

## Linear

O Linear representa a execução operacional deste sistema.

Mapeamento padrão:

```text
Objetivo estratégico → Iniciativa
Grande entrega → Projeto
Etapa relevante → Marco
Unidade de trabalho → Issue
Implementação granular → Sub-issue
Período de execução → Ciclo
Conhecimento → Documento
```

### Estados de Issues

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

### Estados de Projetos

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

### Rótulos

Preferir grupos consistentes e evitar redundância.

**Tipo:** Funcionalidade, Melhoria, Defeito, Dívida técnica, Pesquisa, Experimento.

**Impacto:** Crítico, Alto, Médio, Baixo.

**Origem:** Cliente, Equipe, Dados, Suporte, Estratégia.

## Qualidade

Não considerar trabalho concluído apenas porque o código foi escrito.

Verificar, quando aplicável:

- testes automatizados;
- critérios de aceitação;
- tratamento de erros;
- segurança;
- desempenho;
- acessibilidade;
- observabilidade;
- documentação;
- migração;
- compatibilidade;
- rollback.

## Comportamento esperado dos agentes

Os agentes devem:

- ler antes de alterar;
- preservar contexto;
- citar arquivos relevantes nas análises;
- evitar duplicar documentação;
- atualizar documentação afetada;
- apontar contradições;
- declarar hipóteses;
- reduzir ambiguidade;
- evitar mudanças não solicitadas;
- manter rastreabilidade entre decisão e implementação.

Os agentes não devem:

- inventar decisões de negócio;
- apagar contexto histórico útil;
- substituir documentos canônicos sem justificativa;
- misturar descoberta com implementação sem necessidade;
- criar abstrações prematuras;
- alterar arquitetura silenciosamente;
- criar rótulos ou estados desnecessários.

## Regra para dúvidas

Quando houver informação insuficiente:

1. procurar primeiro no repositório;
2. consultar documentação relacionada;
3. identificar a lacuna;
4. registrar a hipótese necessária;
5. evitar transformar hipótese em fato.

## Definição de concluído

Uma entrega relevante está concluída quando:

```text
[ ] Especificação atendida
[ ] Critérios de aceitação validados
[ ] Testes adequados concluídos
[ ] Riscos relevantes tratados
[ ] Documentação atualizada
[ ] Linear atualizado
[ ] Métricas ou validação pós-lançamento definidas
```

## Regra final

O objetivo não é apenas produzir código.

O objetivo é manter **produto, conhecimento, planejamento e implementação sincronizados**, permitindo que pessoas e agentes de IA entendam por que algo existe, o que deve ser feito, como deve funcionar, como validar e qual resultado é esperado.
