import { eq } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import { hashSenha, precisaRehash, verificarSenha, type ParametrosScrypt } from "../auth/senha";
import { criarSessao, revogarSessao, type SessaoCriada } from "../auth/sessao";
import type { EntradaCadastro, EntradaEntrar, UsuarioPrivado } from "../contracts/auth";
import type { Banco } from "../db/cliente";
import { codigoPg, restricaoPg } from "../db/erros";
import { usuarios, type Usuario } from "../db/esquema";
import { ErroApi } from "../http/erros";

export interface DependenciasAuth {
  db: Banco;
  agora: () => Date;
  parametrosSenha: ParametrosScrypt;
}

export interface ContextoRequisicao {
  ip: string;
  agente: string | null;
}

export interface ResultadoSessao {
  usuario: UsuarioPrivado;
  sessao: SessaoCriada;
}

export const MENSAGEM_LOGIN_INVALIDO = "E-mail ou senha incorretos.";

export function paraUsuarioPrivado(
  linha: Pick<Usuario, "id" | "usuario" | "nome" | "bio" | "avatarUrl" | "bannerUrl" | "criadoEm" | "email" | "papel">,
): UsuarioPrivado {
  return {
    id: linha.id,
    usuario: linha.usuario,
    nome: linha.nome,
    bio: linha.bio,
    avatar: linha.avatarUrl,
    banner: linha.bannerUrl,
    criadoEm: linha.criadoEm.toISOString(),
    email: linha.email,
    papel: linha.papel,
  };
}

export async function cadastrar(
  deps: DependenciasAuth,
  entrada: EntradaCadastro,
  contexto: ContextoRequisicao,
): Promise<ResultadoSessao> {
  const agora = deps.agora();
  await consumirLimite(deps.db, LIMITES.cadastroIp, contexto.ip, agora);
  await consumirLimite(deps.db, LIMITES.cadastroEmail, entrada.email, agora);

  // O hash é calculado antes de consultar o banco, para que "já existe" e "criado" gastem tempo parecido.
  const senhaHash = await hashSenha(entrada.senha, deps.parametrosSenha);

  let criado: Usuario;
  try {
    [criado] = await deps.db
      .insert(usuarios)
      .values({
        usuario: entrada.usuario,
        email: entrada.email,
        senhaHash,
        nome: entrada.nome ?? entrada.usuario,
        criadoEm: agora,
        atualizadoEm: agora,
      })
      .returning();
  } catch (erro) {
    if (codigoPg(erro) === "23505") {
      // Nomes de usuário são públicos nos perfis, então podem ser apontados. Já a existência de um
      // e-mail não é revelada: a resposta é genérica (sem verificação de e-mail ainda não há como
      // esconder o conflito por completo; ver docs/backend/README.md).
      if (restricaoPg(erro) === "usuarios_usuario_unique") {
        throw new ErroApi("conflito", "Este nome de usuário já está em uso.", {
          campos: { usuario: "Este nome de usuário já está em uso." },
        });
      }
      throw new ErroApi("conflito", "Não foi possível criar a conta com esses dados.");
    }
    throw erro;
  }

  const sessao = await criarSessao(deps.db, criado.id, { agora, agente: contexto.agente });
  return { usuario: paraUsuarioPrivado(criado), sessao };
}

// Hash descartável para comparar quando o e-mail não existe: o tempo de resposta não revela a conta.
const hashesFalsos = new Map<string, Promise<string>>();
function hashFalso(parametros: ParametrosScrypt): Promise<string> {
  const chave = `${parametros.N}:${parametros.r}:${parametros.p}`;
  let hash = hashesFalsos.get(chave);
  if (!hash) {
    hash = hashSenha(`falso-${Math.random()}-${Date.now()}`, parametros);
    hashesFalsos.set(chave, hash);
  }
  return hash;
}

export async function entrar(
  deps: DependenciasAuth,
  entrada: EntradaEntrar,
  contexto: ContextoRequisicao,
): Promise<ResultadoSessao> {
  const agora = deps.agora();
  await consumirLimite(deps.db, LIMITES.entrarIp, contexto.ip, agora);
  await consumirLimite(deps.db, LIMITES.entrarEmail, entrada.email, agora);

  const [encontrado] = await deps.db.select().from(usuarios).where(eq(usuarios.email, entrada.email));
  const correta = await verificarSenha(entrada.senha, encontrado?.senhaHash ?? (await hashFalso(deps.parametrosSenha)));
  if (!encontrado || !correta) throw new ErroApi("nao_autenticado", MENSAGEM_LOGIN_INVALIDO);

  // Parâmetros do scrypt mudaram desde que a senha foi gravada: regrava com os atuais.
  if (precisaRehash(encontrado.senhaHash, deps.parametrosSenha)) {
    const novoHash = await hashSenha(entrada.senha, deps.parametrosSenha);
    await deps.db.update(usuarios).set({ senhaHash: novoHash, atualizadoEm: agora }).where(eq(usuarios.id, encontrado.id));
  }

  const sessao = await criarSessao(deps.db, encontrado.id, { agora, agente: contexto.agente });
  return { usuario: paraUsuarioPrivado(encontrado), sessao };
}

export async function sair(deps: DependenciasAuth, token: string | null): Promise<void> {
  if (token) await revogarSessao(deps.db, token, deps.agora());
}
