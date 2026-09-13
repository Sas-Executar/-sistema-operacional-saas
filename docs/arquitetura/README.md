# `docs/arquitetura/` — Arquitetura

Documentação de arquitetura e engenharia: visão geral do sistema, mapa de contextos, diagramas,
ADRs (decisões arquiteturais) e práticas de engenharia (testes, camada agêntica, métricas de
entrega, integrações).

## Estrutura

```text
arquitetura/
├── visao-geral.md          # visão do sistema (eixos, segurança, operação)
├── mapa-de-contexto.md     # bounded contexts e relações
├── diagramas.md            # diagramas Mermaid
├── adr/                    # Architecture Decision Records (imutáveis)
├── _templates/             # templates internos usados pelo /kickoff e /mapear
└── engenharia/              # testes, camada agêntica, métricas, integrações
```

## Regras

- ADRs são **imutáveis**: uma decisão que muda gera um novo ADR que substitui o anterior — nunca
  edite um ADR já aceito para mudar a decisão em si.
- Decisão arquitetural relevante (escolha tecnológica, mudança estrutural, integração crítica,
  banco de dados, autenticação, decisão difícil de reverter) exige ADR — ver `AGENTS.md`.
- Este diretório trata de decisões e estrutura *técnica*. Decisões de produto/negócio ficam em
  `docs/decisoes/`.
