// Códigos de erro da API e o status HTTP de cada um (docs/API.md, seção 1).
export const STATUS_POR_CODIGO = {
  requisicao_invalida: 400,
  nao_autenticado: 401,
  sem_permissao: 403,
  nao_encontrado: 404,
  conflito: 409,
  corpo_grande: 413,
  arquivo_grande: 413,
  tipo_nao_suportado: 415,
  validacao: 422,
  limite_excedido: 429,
  erro_interno: 500,
} as const;

export type CodigoErro = keyof typeof STATUS_POR_CODIGO;

export const MENSAGEM_PADRAO: Record<CodigoErro, string> = {
  requisicao_invalida: "Requisição inválida.",
  nao_autenticado: "Entre para continuar.",
  sem_permissao: "Você não tem permissão para fazer isso.",
  nao_encontrado: "Não encontrado.",
  conflito: "Esta operação conflita com o estado atual.",
  corpo_grande: "O corpo da requisição é grande demais.",
  arquivo_grande: "O arquivo é grande demais.",
  tipo_nao_suportado: "Tipo de conteúdo não suportado.",
  validacao: "Revise os campos destacados.",
  limite_excedido: "Muitas requisições. Tente novamente em instantes.",
  erro_interno: "Algo deu errado. Tente novamente.",
};

export interface OpcoesErroApi {
  campos?: Record<string, string>;
  // Segundos até a próxima tentativa (cabeçalho Retry-After em `limite_excedido`).
  retryAfter?: number;
  // Erro original, só para diagnóstico interno. Nunca vai na resposta.
  causa?: unknown;
}

// Único tipo de erro cujo conteúdo pode chegar ao cliente. Qualquer outro erro vira `erro_interno` genérico.
export class ErroApi extends Error {
  readonly status: number;
  readonly campos?: Record<string, string>;
  readonly retryAfter?: number;
  readonly causa?: unknown;

  constructor(
    public readonly codigo: CodigoErro,
    mensagem: string = MENSAGEM_PADRAO[codigo],
    opcoes: OpcoesErroApi = {},
  ) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = STATUS_POR_CODIGO[codigo];
    this.campos = opcoes.campos;
    this.retryAfter = opcoes.retryAfter;
    this.causa = opcoes.causa;
  }
}
