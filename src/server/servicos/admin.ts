import { and, eq, isNull, sql } from "drizzle-orm";

import { PARAMETROS_PADRAO, hashSenha, type ParametrosScrypt } from "../auth/senha";
import { esquemaCadastro } from "../contracts/auth";
import type { Banco } from "../db/cliente";
import { codigoPg, restricaoPg } from "../db/erros";
import { sessoes, usuarios } from "../db/esquema";
import { camposDoErro } from "../http/validar";
import { registrarAuditoria } from "./auditoria";

export const ROTULO_BOOTSTRAP = "cli:admin:criar";

export type CodigoBootstrap = "entrada_invalida" | "ja_existe_admin" | "conflito" | "alvo_inexistente";

export class ErroBootstrap extends Error {
  constructor(
    public readonly codigo: CodigoBootstrap,
    mensagem: string,
    public readonly campos?: Record<string, string>,
  ) {
    super(mensagem);
    this.name = "ErroBootstrap";
  }
}

export type EntradaPrimeiroAdmin =
  // Cria uma conta nova já como administrador.
  | { modo: "criar"; usuario: string; email: string; nome?: string; senha: string }
  // Promove uma conta existente (pelo nome de usuário). Revoga as sessões dela.
  | { modo: "promover"; usuario: string };

export interface OpcoesPrimeiroAdmin {
  agora?: () => Date;
  parametrosSenha?: ParametrosScrypt;
}

export interface ResultadoPrimeiroAdmin {
  id: string;
  usuario: string;
  modo: "criar" | "promover";
}

// Único caminho que cria administrador. Não há rota HTTP: roda só pelo script `npm run admin:criar`.
// Dentro de uma transação, sob um bloqueio consultivo exclusivo, recusa se já existe qualquer administrador;
// execuções simultâneas se enfileiram e só a primeira vence. Grava uma auditoria `admin.bootstrap` na mesma
// transação, sem senha, hash nem e-mail (ator nulo, rótulo `cli:admin:criar`).
export async function criarPrimeiroAdmin(
  db: Banco,
  entrada: EntradaPrimeiroAdmin,
  opcoes: OpcoesPrimeiroAdmin = {},
): Promise<ResultadoPrimeiroAdmin> {
  const agora = (opcoes.agora ?? (() => new Date()))();

  let dados: { usuario: string; email: string; nome: string; senhaHash: string } | undefined;
  let usuarioPromovido: string | undefined;
  if (entrada.modo === "criar") {
    const resultado = esquemaCadastro.safeParse({ usuario: entrada.usuario, email: entrada.email, senha: entrada.senha, nome: entrada.nome });
    if (!resultado.success) throw new ErroBootstrap("entrada_invalida", "Dados inválidos.", camposDoErro(resultado.error));
    // A recusa rápida evita gastar o hash quando já existe administrador; a decisão final é a da transação.
    await recusarSeJaExiste(db);
    const senhaHash = await hashSenha(resultado.data.senha, opcoes.parametrosSenha ?? PARAMETROS_PADRAO);
    dados = { usuario: resultado.data.usuario, email: resultado.data.email, nome: resultado.data.nome ?? resultado.data.usuario, senhaHash };
  } else {
    const nome = entrada.usuario.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(nome)) throw new ErroBootstrap("entrada_invalida", "Dados inválidos.", { usuario: "Nome de usuário inválido." });
    usuarioPromovido = nome;
  }

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended('admin:bootstrap', 0))`);
    await recusarSeJaExiste(tx);

    if (dados) {
      let criado;
      try {
        [criado] = await tx
          .insert(usuarios)
          .values({ usuario: dados.usuario, email: dados.email, senhaHash: dados.senhaHash, nome: dados.nome, papel: "admin", criadoEm: agora, atualizadoEm: agora })
          .returning({ id: usuarios.id, usuario: usuarios.usuario });
      } catch (erro) {
        if (codigoPg(erro) === "23505") {
          const campo = restricaoPg(erro) === "usuarios_usuario_unique" ? "usuario" : "email";
          throw new ErroBootstrap("conflito", "Já existe uma conta com esse usuário ou e-mail. Use --promover para promover uma conta existente.", {
            [campo]: "Já está em uso.",
          });
        }
        throw erro;
      }
      await registrarAuditoria(tx, {
        atorId: null,
        atorRotulo: ROTULO_BOOTSTRAP,
        acao: "admin.bootstrap",
        alvoTipo: "usuario",
        alvoId: criado.id,
        antes: null,
        depois: { papel: "admin", modo: "criar" },
        criadoEm: agora,
      });
      return { id: criado.id, usuario: criado.usuario, modo: "criar" as const };
    }

    const [alvo] = await tx.select().from(usuarios).where(eq(usuarios.usuario, usuarioPromovido as string)).for("update");
    if (!alvo) throw new ErroBootstrap("alvo_inexistente", "Não existe conta com esse nome de usuário.");
    await tx.update(usuarios).set({ papel: "admin", atualizadoEm: agora }).where(eq(usuarios.id, alvo.id));
    // Mudança de privilégio: sessões abertas dessa conta deixam de valer (a pessoa entra de novo).
    await tx.update(sessoes).set({ revogadaEm: agora }).where(and(eq(sessoes.usuarioId, alvo.id), isNull(sessoes.revogadaEm)));
    await registrarAuditoria(tx, {
      atorId: null,
      atorRotulo: ROTULO_BOOTSTRAP,
      acao: "admin.bootstrap",
      alvoTipo: "usuario",
      alvoId: alvo.id,
      antes: { papel: alvo.papel },
      depois: { papel: "admin", modo: "promover" },
      criadoEm: agora,
    });
    return { id: alvo.id, usuario: alvo.usuario, modo: "promover" as const };
  });
}

async function recusarSeJaExiste(executor: Pick<Banco, "select">): Promise<void> {
  const [existente] = await executor.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.papel, "admin")).limit(1);
  if (existente) {
    throw new ErroBootstrap("ja_existe_admin", "Já existe um administrador. Nada foi alterado.");
  }
}
