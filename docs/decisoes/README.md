# `docs/decisoes/` — Decisões

Registro de decisões **não puramente técnicas** (estratégia, produto, processo, organização do
próprio sistema operacional). Decisões técnicas de arquitetura ficam em `docs/arquitetura/adr/`
usando o template de ADR técnico; decisões estruturais deste "sistema operacional" (como este
bootstrap) também usam o formato ADR, registrado aqui.

## Formato

Usar `templates/adr.md`. Cada decisão deve conter, no mínimo:

```text
Contexto
Decisão
Alternativas consideradas
Consequências
Riscos
```

## Regras

- Decisões são numeradas sequencialmente (`0001-titulo-curto.md`, `0002-...`).
- Uma decisão superada não é apagada: cria-se uma nova decisão que a substitui e referencia a
  anterior.
- Toda decisão relevante deve poder ser rastreada até o problema/evidência que a motivou (corpus,
  pesquisa, dado) e até a especificação/execução que ela impactou.
