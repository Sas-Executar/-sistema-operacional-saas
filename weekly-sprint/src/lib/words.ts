/**
 * Contagem de palavras determinística.
 *
 * O `normative.yaml` impõe limites de palavras mas não define o que conta como
 * palavra. Sem uma regra fixa, "D07-PH-1400 encerrada" poderia valer 2 ou 4, e
 * o mesmo texto passaria ou falharia dependendo de quem contasse. A regra
 * abaixo é a definição operacional adotada, registrada aqui porque não existe
 * no contrato:
 *
 * 1. Separa por espaço em branco.
 * 2. Remove pontuação de borda (`.,;:!?()[]{}"'«»…`), preservando a interna.
 * 3. Tokens ligados por hífen ou barra permanecem uma palavra:
 *    "D07-PH-1400" = 1, "EXE-74/75" = 1, "pré-requisito" = 1.
 * 4. Fragmentos que sobram só com pontuação não contam.
 *
 * O item 3 é o que importa na prática: identificadores de origem são uma
 * unidade de significado, e contá-los como 3 ou 4 palavras reprovaria conteúdo
 * que respeita o contrato.
 */

/** Pontuação removida apenas nas bordas do token. */
const EDGE_PUNCTUATION = /^[.,;:!?()[\]{}"'«»…]+|[.,;:!?()[\]{}"'«»…]+$/g;

/** Divide um texto nas palavras que o contrato considera. */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\s+/)
    .map((token) => token.replace(EDGE_PUNCTUATION, ""))
    .filter((token) => token.length > 0);
}

/** Número de palavras de um texto, pela regra acima. */
export function countWords(text: string): number {
  return tokenize(text).length;
}
