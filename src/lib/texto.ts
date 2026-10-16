// Normaliza um texto para comparação em buscas: minúsculas e sem acentos.
// "Frequência" e "frequencia" viram a mesma sequência. Não altera o texto original.
export function normalizarParaBusca(texto: string): string {
  return texto
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "");
}
