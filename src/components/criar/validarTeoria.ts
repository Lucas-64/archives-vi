// Limites técnicos de validação de teoria (ver docs/page-specs/criar.md, seção 3).
export const LIMITES_TEORIA = {
  titulo: { minimo: 3, maximo: 120 },
  texto: { minimo: 20, maximo: 2000 },
} as const;

export interface RascunhoTeoria {
  titulo: string;
  texto: string;
}

export type ErrosTeoria = Partial<Record<keyof RascunhoTeoria, string>>;

// Valida pelo conteúdo sem espaços nas pontas. Só devolve as chaves com erro.
export function validarTeoria(rascunho: RascunhoTeoria): ErrosTeoria {
  const erros: ErrosTeoria = {};
  const titulo = rascunho.titulo.trim();
  const texto = rascunho.texto.trim();
  const { titulo: limiteTitulo, texto: limiteTexto } = LIMITES_TEORIA;

  if (titulo.length === 0) {
    erros.titulo = "Informe um título para a teoria.";
  } else if (titulo.length < limiteTitulo.minimo) {
    erros.titulo = `O título precisa ter pelo menos ${limiteTitulo.minimo} caracteres.`;
  } else if (titulo.length > limiteTitulo.maximo) {
    erros.titulo = `O título pode ter no máximo ${limiteTitulo.maximo} caracteres.`;
  }

  if (texto.length === 0) {
    erros.texto = "Escreva o texto da teoria.";
  } else if (texto.length < limiteTexto.minimo) {
    erros.texto = `O texto precisa ter pelo menos ${limiteTexto.minimo} caracteres.`;
  } else if (texto.length > limiteTexto.maximo) {
    erros.texto = `O texto pode ter no máximo ${limiteTexto.maximo} caracteres.`;
  }

  return erros;
}

export function temErros(erros: ErrosTeoria): boolean {
  return Object.keys(erros).length > 0;
}
