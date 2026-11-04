// Criação de mistério pela API real (POST /api/v1/misterios), no navegador. Só há sucesso quando o servidor
// responde 201 com o `slug` gravado; limites e permissões são decididos pelo servidor.
import { chamar, texto } from "./publicacoesApi";

export interface EntradaMisterio {
  titulo: string;
  descricao: string;
  classificacao: string;
  imagem?: string;
  video?: { url: string; titulo?: string };
}

export function criarMisterioNaApi(dados: EntradaMisterio) {
  return chamar(
    "/api/v1/misterios",
    "POST",
    dados,
    ["titulo", "descricao", "classificacao", "imagem", "video.url", "video.titulo"],
    (json) => {
      const slug = (json as { slug?: unknown } | null)?.slug;
      return texto(slug) ? { slug } : null;
    },
  );
}
