---
name: corpus
description: Regras para tratar documentos brutos (corpus) antes de virarem conhecimento canônico. Leia antes de processar qualquer material bruto novo.
alwaysApply: false
---

# `docs/corpus/` — Material bruto

Esta pasta guarda documentos brutos e materiais de referência: anotações, transcrições de
reuniões, pesquisas, prints, e-mails, apresentações, decisões históricas, exports de outras
ferramentas etc.

## Regras obrigatórias

1. **O corpus não é automaticamente verdade canônica.** Nada aqui pode ser citado como fato
   consolidado só porque está escrito — precisa passar por análise antes de virar documentação
   em `docs/estrategia/`, `docs/produto/`, `docs/clientes/`, `docs/mercado/`, `docs/arquitetura/`
   ou `docs/decisoes/`.
2. **Toda afirmação relevante extraída do corpus precisa ter origem identificada**: de qual
   arquivo, de qual data, de quem (quando souber). Sem origem rastreável, a afirmação não pode
   ser tratada como confiável.
3. **O corpus pode conter conflitos.** Documentos diferentes podem contradizer uns aos outros
   (decisões antigas substituídas, hipóteses que não se confirmaram, informação desatualizada).
   Encontrar um conflito não é erro — é esperado. O que não é aceitável é ignorá-lo.
4. **Classifique cada afirmação relevante** ao consolidá-la, usando exatamente um destes rótulos:

   ```text
   Confirmado    — validado por evidência direta e atual (dado, teste, decisão registrada)
   Inferido      — deduzido a partir de evidência indireta ou parcial
   Hipótese      — suposição ainda não validada
   Não definido  — não há informação suficiente no corpus
   Conflitante   — o corpus traz versões contraditórias sobre o mesmo ponto
   ```

5. **Nunca invente informação para preencher uma lacuna.** Se o corpus não diz, o rótulo correto
   é `Não definido` — não um palpite disfarçado de fato.
6. Ao consolidar um documento canônico a partir do corpus, cite a origem (arquivo/fonte) e o
   rótulo de confiança ao lado de cada afirmação relevante, para manter rastreabilidade.

## Estado atual

Esta pasta está **vazia por padrão** — não existe corpus real neste repositório ainda. As regras
acima são o contrato para quando o corpus for inserido (ver `docs/decisoes/` para o registro do
processo de bootstrap e `docs/operacao/estado.md` para o próximo passo recomendado).

## Fluxo recomendado ao receber um novo corpus

1. Adicionar os arquivos brutos aqui, preservando nome/origem/data quando possível.
2. Ler o material e identificar informações contraditórias ou incompletas.
3. Classificar as afirmações relevantes (ver rótulos acima).
4. Atualizar a documentação canônica correspondente em `docs/`.
5. Registrar decisões que exijam ADR em `docs/decisoes/`.
6. Sinalizar dúvidas e lacunas em vez de resolvê-las por suposição.
