// Validação local do formulário de investigação. Espelha os limites do contrato do servidor
// (`LIMITES_INVESTIGACAO` em src/server/contracts/investigacoes.ts; o teste valida que continuam iguais).
// É só conveniência: o servidor valida de novo e é quem decide.
export const LIMITES_NOVA_INVESTIGACAO = {
  titulo: { minimo: 3, maximo: 120 },
  descricao: { minimo: 20, maximo: 500 },
  localizacao: { maximo: 80 },
  hipotese: { minimo: 20, maximo: 2000 },
  perguntaCentral: { minimo: 5, maximo: 300 },
  item: { maximo: 300 },
  itensPorLista: 10,
  videoUrl: 200,
  videoTitulo: 120,
  imagemUrl: 400,
} as const;

export const CATEGORIAS_NOVA_INVESTIGACAO = [
  "sighting",
  "location",
  "symbol",
  "broadcast",
  "phenomenon",
  "community-discovery",
] as const;

export interface RascunhoInvestigacao {
  titulo: string;
  descricao: string;
  categoria: string;
  localizacao: string;
  tags: string[];
  videoUrl: string;
  videoTitulo: string;
  imagemUrl: string;
  hipotese: string;
  argumentos: string[];
  perguntaCentral: string;
  fontes: string[];
}

export const RASCUNHO_VAZIO: RascunhoInvestigacao = {
  titulo: "",
  descricao: "",
  categoria: "",
  localizacao: "",
  tags: [],
  videoUrl: "",
  videoTitulo: "",
  imagemUrl: "",
  hipotese: "",
  argumentos: [],
  perguntaCentral: "",
  fontes: [],
};

// Chaves iguais às do servidor (`teoria.hipotese`, `teoria.fontes.2`, `video.url`...), para que os erros
// locais e os recusados pela API apareçam do mesmo jeito.
export type ErrosInvestigacao = Record<string, string>;

function faixa(valor: string, rotulo: string, minimo: number, maximo: number): string | undefined {
  const tamanho = valor.trim().length;
  const inicial = `${rotulo[0].toUpperCase()}${rotulo.slice(1)}`;
  if (tamanho === 0) return `Informe ${rotulo}.`;
  if (tamanho < minimo) return `${inicial} precisa ter pelo menos ${minimo} caracteres.`;
  if (tamanho > maximo) return `${inicial} pode ter no máximo ${maximo} caracteres.`;
  return undefined;
}

function enderecoHttps(valor: string): boolean {
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
}

export function validarInvestigacao(r: RascunhoInvestigacao): ErrosInvestigacao {
  const L = LIMITES_NOVA_INVESTIGACAO;
  const erros: ErrosInvestigacao = {};
  const marcar = (chave: string, mensagem: string | undefined) => {
    if (mensagem) erros[chave] = mensagem;
  };

  marcar("titulo", faixa(r.titulo, "o título", L.titulo.minimo, L.titulo.maximo));
  marcar("descricao", faixa(r.descricao, "a descrição", L.descricao.minimo, L.descricao.maximo));
  if (!(CATEGORIAS_NOVA_INVESTIGACAO as readonly string[]).includes(r.categoria)) erros.categoria = "Escolha uma categoria.";
  if (r.localizacao.trim().length > L.localizacao.maximo) {
    erros.localizacao = `A localização pode ter no máximo ${L.localizacao.maximo} caracteres.`;
  }

  const temVideo = r.videoUrl.trim() !== "" || r.videoTitulo.trim() !== "";
  if (temVideo) {
    if (r.videoUrl.trim() === "") erros["video.url"] = "Informe o link do vídeo.";
    else if (r.videoUrl.trim().length > L.videoUrl) erros["video.url"] = "O link do vídeo é longo demais.";
    if (r.videoTitulo.trim().length > L.videoTitulo) {
      erros["video.titulo"] = `O título do vídeo pode ter no máximo ${L.videoTitulo} caracteres.`;
    }
  }

  // Imagem de capa (opcional): endereço https. O servidor valida de novo.
  const imagem = r.imagemUrl.trim();
  if (imagem !== "") {
    if (imagem.length > L.imagemUrl) erros.imagem = "O endereço da imagem é longo demais.";
    else if (!enderecoHttps(imagem)) erros.imagem = "Use um endereço de imagem que comece com https://.";
  }

  marcar("teoria.hipotese", faixa(r.hipotese, "a hipótese", L.hipotese.minimo, L.hipotese.maximo));
  marcar("teoria.perguntaCentral", faixa(r.perguntaCentral, "a pergunta central", L.perguntaCentral.minimo, L.perguntaCentral.maximo));

  const itens = (valores: string[], prefixo: string, rotulo: string) =>
    valores.forEach((valor, i) => marcar(`${prefixo}.${i}`, faixa(valor, rotulo, 1, L.item.maximo)));
  itens(r.argumentos, "teoria.argumentosFavoraveis", "o argumento");
  itens(r.fontes, "teoria.fontes", "a fonte");

  return erros;
}

// Monta o corpo exatamente no formato do contrato. Campos opcionais vazios não são enviados.
export function montarEntrada(r: RascunhoInvestigacao) {
  const videoUrl = r.videoUrl.trim();
  const videoTitulo = r.videoTitulo.trim();
  const imagem = r.imagemUrl.trim();
  return {
    titulo: r.titulo.trim(),
    descricao: r.descricao.trim(),
    categoria: r.categoria,
    ...(r.localizacao.trim() ? { localizacao: r.localizacao.trim() } : {}),
    tags: r.tags,
    ...(imagem ? { imagem } : {}),
    ...(videoUrl ? { video: { url: videoUrl, ...(videoTitulo ? { titulo: videoTitulo } : {}) } } : {}),
    teoria: {
      hipotese: r.hipotese.trim(),
      argumentosFavoraveis: r.argumentos.map((a) => a.trim()),
      perguntaCentral: r.perguntaCentral.trim(),
      fontes: r.fontes.map((f) => f.trim()),
    },
  };
}
