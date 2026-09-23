---
name: root-readme
description: Página inicial do repositório — visão geral do sistema operacional do SaaS. Puxe ao chegar no repo por primeira vez.
alwaysApply: false
---

# Sistema Operacional do SaaS

Repositório canônico para estratégia, produto, engenharia, documentação e execução do SaaS.

O objetivo é transformar conhecimento disperso em um sistema operacional estruturado, utilizável por pessoas e agentes de IA, com espelhamento operacional no Linear.

## Princípios

1. **Português do Brasil como idioma padrão**
   - documentação;
   - iniciativas;
   - projetos;
   - marcos;
   - issues e subtarefas;
   - estados;
   - rótulos;
   - templates;
   - decisões.

   Inglês deve ser usado apenas quando tecnicamente necessário em código, APIs, bibliotecas, protocolos, identificadores ou nomes oficiais externos.

2. **Documentação antes da implementação**

   Fluxo principal:

   `Problema → Evidência → Especificação → Execução → Validação → Resultado`

3. **Fonte única da verdade**

   Este repositório é a referência canônica do produto. O Linear deve refletir sua estrutura operacional.

## Metodologias de referência

Este sistema combina principalmente:

- **Spec Driven**, de Igor Uehara — base para visão, especificações, arquitetura, ADRs, engenharia e execução orientada a especificações.
- **PM Skills**, de Lucas Garavelli — base para discovery, estratégia, ICP, priorização, experimentos, métricas, lançamento e GTM.

As referências devem ser adaptadas ao contexto deste SaaS, evitando estruturas metodológicas concorrentes.

## Estrutura prevista

```text
.
├── AGENTS.md
├── .agents/
│   └── skills/
├── docs/
│   ├── corpus/
│   ├── estrategia/
│   ├── produto/
│   ├── clientes/
│   ├── mercado/
│   ├── arquitetura/
│   ├── decisoes/
│   └── operacao/
├── specs/
├── templates/
└── README.md
```

### `docs/corpus`

Contém documentos brutos e materiais de referência. O corpus não deve ser tratado automaticamente como verdade canônica. Seu conteúdo precisa ser analisado, reconciliado e convertido em documentação estruturada.

## Fluxo para agentes de IA

Antes de implementar funcionalidades relevantes, o agente deve:

1. ler o corpus relevante;
2. identificar informações contraditórias ou incompletas;
3. atualizar a documentação canônica;
4. produzir ou atualizar a especificação;
5. identificar decisões arquiteturais necessárias;
6. definir critérios de aceitação;
7. decompor o trabalho em unidades executáveis;
8. somente então iniciar a implementação.

## Espelhamento no Linear

- **Iniciativas** → objetivos estratégicos;
- **Projetos** → grandes funcionalidades ou entregas;
- **Marcos** → etapas do projeto;
- **Issues** → unidades de trabalho;
- **Sub-issues** → implementação granular;
- **Ciclos** → períodos de execução;
- **Documentos** → conhecimento e especificações;
- **Rótulos** → classificação transversal.

Estados, rótulos e nomenclaturas devem permanecer em português.

## Objetivo final

Construir um sistema onde estratégia, produto, engenharia, documentação e execução permaneçam sincronizados.

```text
Corpus
  ↓
Conhecimento canônico
  ↓
Estratégia e Produto
  ↓
Especificações
  ↓
Linear
  ↓
Implementação
  ↓
Validação
  ↓
Aprendizado
```
