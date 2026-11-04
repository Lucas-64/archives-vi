import { CLASSIFICACOES_MISTERIO } from "../../constants/classificacoesMisterio";
import { urlDeImagemPermitida } from "../../lib/urlImagem";

// Espelha os limites do contrato do servidor (`LIMITES_MISTERIO` em src/server/contracts/misterios.ts). É só
// conveniência: o servidor valida de novo e é quem decide.
export const LIMITES_NOVO_MISTERIO = {
  titulo: { minimo: 3, maximo: 120 },
  descricao: { minimo: 20, maximo: 500 },
  videoUrl: 200,
  videoTitulo: 120,
  imagemUrl: 400,
} as const;

export interface RascunhoMisterio {
  titulo: string;
  imagemUrl: string;
  videoUrl: string;
  videoTitulo: string;
  descricao: string;
  classificacao: string;
}

export const MISTERIO_VAZIO: RascunhoMisterio = {
  titulo: "",
  imagemUrl: "",
  videoUrl: "",
  videoTitulo: "",
  descricao: "",
  classificacao: "",
};

export type ErrosMisterio = Record<string, string>;

function faixa(valor: string, rotulo: string, minimo: number, maximo: number): string | undefined {
  const tamanho = valor.trim().length;
  const inicial = `${rotulo[0].toUpperCase()}${rotulo.slice(1)}`;
  if (tamanho === 0) return `Informe ${rotulo}.`;
  if (tamanho < minimo) return `${inicial} precisa ter pelo menos ${minimo} caracteres.`;
  if (tamanho > maximo) return `${inicial} pode ter no máximo ${maximo} caracteres.`;
  return undefined;
}

export function validarMisterio(r: RascunhoMisterio): ErrosMisterio {
  const L = LIMITES_NOVO_MISTERIO;
  const erros: ErrosMisterio = {};
  const titulo = faixa(r.titulo, "o título", L.titulo.minimo, L.titulo.maximo);
  if (titulo) erros.titulo = titulo;
  const descricao = faixa(r.descricao, "a descrição", L.descricao.minimo, L.descricao.maximo);
  if (descricao) erros.descricao = descricao;
  if (!CLASSIFICACOES_MISTERIO.some((c) => c.id === r.classificacao)) erros.classificacao = "Escolha uma classificação.";

  const imagem = r.imagemUrl.trim();
  if (imagem !== "") {
    if (imagem.length > L.imagemUrl) erros.imagem = "O endereço da imagem é longo demais.";
    else if (!urlDeImagemPermitida(imagem)) erros.imagem = "Envie a imagem pelo campo de upload.";
  }

  if (r.videoUrl.trim() !== "" || r.videoTitulo.trim() !== "") {
    if (r.videoUrl.trim() === "") erros["video.url"] = "Informe o link do vídeo.";
    else if (r.videoUrl.trim().length > L.videoUrl) erros["video.url"] = "O link do vídeo é longo demais.";
    if (r.videoTitulo.trim().length > L.videoTitulo) erros["video.titulo"] = `O título do vídeo pode ter no máximo ${L.videoTitulo} caracteres.`;
  }
  return erros;
}

export function montarEntradaMisterio(r: RascunhoMisterio) {
  const imagem = r.imagemUrl.trim();
  const videoUrl = r.videoUrl.trim();
  const videoTitulo = r.videoTitulo.trim();
  return {
    titulo: r.titulo.trim(),
    descricao: r.descricao.trim(),
    classificacao: r.classificacao,
    ...(imagem ? { imagem } : {}),
    ...(videoUrl ? { video: { url: videoUrl, ...(videoTitulo ? { titulo: videoTitulo } : {}) } } : {}),
  };
}
