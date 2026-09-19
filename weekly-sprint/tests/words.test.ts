import { describe, expect, it } from "vitest";
import { countWords, tokenize } from "../src/lib/words";

describe("contagem de palavras", () => {
  it("conta palavras separadas por espaço", () => {
    expect(countWords("Fechar corpus e controle da Fase Zero")).toBe(7);
  });

  it("ignora pontuação de borda", () => {
    expect(countWords("Blog paralelo; pré-requisito ainda aberto")).toBe(5);
    expect(countWords("(Matriz publicada)")).toBe(2);
  });

  it("trata identificadores com hífen como uma palavra", () => {
    // A regra existe porque "D07-PH-1400 encerrada" é uma entrega de 2 palavras
    // no contrato; contar 4 reprovaria conteúdo válido.
    expect(countWords("D07-PH-1400 encerrada")).toBe(2);
    expect(tokenize("D07-PH-1400 encerrada")).toEqual(["D07-PH-1400", "encerrada"]);
  });

  it("trata referências com barra como uma palavra", () => {
    expect(countWords("Fechar Runner e sincronização com EXE-74/75")).toBe(6);
  });

  it("preserva hífen interno de palavras compostas", () => {
    expect(countWords("pré-requisito")).toBe(1);
  });

  it("normaliza espaços múltiplos e quebras de linha", () => {
    expect(countWords("  Matriz   publicada \n hoje ")).toBe(3);
  });

  it("devolve zero para vazio", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords(";;")).toBe(0);
  });

  it("marca a fronteira entre 7 e 8 palavras", () => {
    expect(countWords("um dois três quatro cinco seis sete")).toBe(7);
    expect(countWords("um dois três quatro cinco seis sete oito")).toBe(8);
  });
});
