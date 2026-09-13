# -sistema-operacional-saas
Abaixo está um README.md inicial, já orientado para Codex + Spec Driven + Product Management + Linear, com português como padrão obrigatório.

Sistema Operacional do SaaS

Repositório canônico para estratégia, produto, engenharia, documentação e execução do SaaS.

O objetivo deste repositório é transformar conhecimento disperso em um sistema operacional estruturado, utilizável por pessoas e agentes de IA, com integração conceitual ao Linear.

Princípios

1. Português do Brasil como idioma padrão
    * Documentação
    * Projetos
    * Issues
    * Rótulos
    * Estados
    * Marcos
    * Templates
    * Decisões
    Inglês deve ser utilizado apenas quando tecnicamente necessário em código, APIs, bibliotecas ou nomes externos.
2. Documentação antes da implementação
    Fluxo principal:
    Problema → Evidência → Especificação → Execução → Validação → Resultado
3. Fonte única da verdade
    Este repositório é a referência canônica do produto. Linear deve refletir sua estrutura operacional.

Metodologias de referência

Este sistema combina principalmente:

* Spec Driven, de Igor Uehara
    Base para visão, especificações, arquitetura, ADRs, engenharia e execução orientada a especificações.
* PM Skills, de Lucas Garavelli
    Base para discovery, estratégia, ICP, priorização, experimentos, métricas, lançamento e GTM.

Essas referências devem ser adaptadas ao contexto deste SaaS, evitando manter estruturas metodológicas concorrentes.

Estrutura

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

docs/corpus

Contém documentos brutos e materiais de referência.

O corpus não deve ser tratado automaticamente como verdade canônica. Seu conteúdo deve ser analisado, reconciliado e convertido em documentação estruturada.

Fluxo para agentes de IA

Antes de implementar funcionalidades, o agente deve:

1. Ler o corpus relevante.
2. Identificar informações contraditórias ou incompletas.
3. Atualizar a documentação canônica.
4. Produzir ou atualizar a especificação.
5. Identificar decisões arquiteturais necessárias.
6. Definir critérios de aceitação.
7. Decompor o trabalho em unidades executáveis.
8. Somente então iniciar implementação.

Espelhamento no Linear

A estrutura recomendada é:

* Iniciativas → objetivos estratégicos
* Projetos → grandes funcionalidades ou entregas
* Marcos → etapas do projeto
* Issues → unidades de trabalho
* Sub-issues → implementação granular
* Ciclos → períodos de execução
* Documentos → conhecimento e especificações
* Rótulos → classificação transversal

Estados, rótulos e nomenclaturas devem permanecer em português.

Objetivo final

Construir um sistema onde estratégia, produto, engenharia, documentação e execução permaneçam sincronizados.

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

Posso também gerar em seguida o AGENTS.md, que é o arquivo mais importante para instruir o Codex sobre como operar dentro desse repositório.