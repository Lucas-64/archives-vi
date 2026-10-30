import { cookies } from "next/headers";
import { cache } from "react";

import { obterDb } from "../db/cliente";
import { configuracaoCookie } from "./cookie";
import { validarSessao } from "./sessao";

// Quem é a pessoa da sessão, para páginas que dependem dela (/meu-perfil e as páginas de detalhe que dependem de permissões ou de `euCurti`). Nunca inclui e-mail,
// hash nem token. Ler o cookie torna a PÁGINA que chama isto dinâmica; por isso só páginas protegidas usam
// (ADR-027: o shell não lê cookie, para as demais rotas continuarem estáticas).
export interface UsuarioDaSessao {
  id: string;
  usuario: string;
  nome: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  criadoEm: Date;
  // Só para decisões no servidor (permissões de leitura). Nunca passe para componentes de cliente.
  papel: string;
}

// `cookies()` fica FORA do try/catch: o Next sinaliza a dependência de cookie lançando um erro interno que
// não pode ser engolido. Falha de banco não é tratada aqui: a página mostra o estado de erro.
export const usuarioDaSessao = cache(async (): Promise<UsuarioDaSessao | null> => {
  const config = configuracaoCookie(process.env.NODE_ENV === "production");
  const token = (await cookies()).get(config.nome)?.value;
  if (!token) return null;
  const sessao = await validarSessao(obterDb(), token);
  if (!sessao) return null;
  const { id, usuario, nome, bio, avatarUrl, bannerUrl, criadoEm, papel } = sessao.usuario;
  return { id, usuario, nome, bio, avatarUrl, bannerUrl, criadoEm, papel };
});
