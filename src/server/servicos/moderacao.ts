import { eq } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type { Banco } from "../db/cliente";
import { investigacoes, usuarios, type StatusInvestigacao } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { registrarAuditoria } from "./auditoria";
import { comVisitante, obterInvestigacao, registrarHistorico } from "./investigacoes";
import type { Ator } from "./evidencias";

export interface DependenciasModeracao {
  db: Banco;
  agora: () => Date;
}

const ehModeracao = (papel: string) => papel === "moderador" || papel === "admin";

// Muda o `status` (eixo da listagem). Qualquer transição entre os cinco valores reais é permitida, sempre com
// motivo, e nenhuma é irreversível. Quem modera não muda o status da PRÓPRIA investigação, e o responsável sem
// papel de moderação não tem esse poder. Repetir o status atual é sucesso sem efeito (sem auditoria).
// Não altera `atualizado_em` (a ordem da listagem não muda) nem `estado`, teoria ou encerramento.
// Histórico público e auditoria nascem na mesma transação da mudança.
export async function mudarStatusInvestigacao(
  deps: DependenciasModeracao,
  ator: Ator,
  slug: string,
  entrada: { status: StatusInvestigacao; motivo: string },
) {
  if (!ehModeracao(ator.papel)) throw new ErroApi("sem_permissao");
  const agora = deps.agora();
  const [existe] = await deps.db.select({ id: investigacoes.id }).from(investigacoes).where(eq(investigacoes.slug, slug));
  if (!existe) throw new ErroApi("nao_encontrado", "Investigação não encontrada.");
  await consumirLimite(deps.db, LIMITES.moderacaoAgir, ator.id, agora);

  await deps.db.transaction(async (tx) => {
    // Papel relido sob a transação: rebaixamento recente vale.
    const [atual] = await tx.select({ papel: usuarios.papel }).from(usuarios).where(eq(usuarios.id, ator.id));
    if (!atual || !ehModeracao(atual.papel)) throw new ErroApi("sem_permissao");

    const [travada] = await tx.select().from(investigacoes).where(eq(investigacoes.id, existe.id)).for("update");
    if (travada.autorId === ator.id) {
      throw new ErroApi("sem_permissao", "Você não pode alterar o status da própria investigação.");
    }
    if (travada.status === entrada.status) return;

    await tx.update(investigacoes).set({ status: entrada.status }).where(eq(investigacoes.id, travada.id));
    // O motivo fica só na auditoria; o histórico público registra apenas a transição.
    await registrarHistorico(tx, travada.id, ator.id, "status", "Status alterado", `De ${travada.status} para ${entrada.status}.`, agora);
    await registrarAuditoria(tx, {
      atorId: ator.id,
      acao: "investigacao.status",
      alvoTipo: "investigacao",
      alvoId: travada.id,
      antes: { status: travada.status },
      depois: { status: entrada.status },
      motivo: entrada.motivo,
      criadoEm: agora,
    });
  });

  return obterInvestigacao(comVisitante(deps, ator), slug);
}

export interface UsuarioComPapel {
  usuario: string;
  nome: string;
  papel: string;
}

// Só o administrador troca papéis, e só entre `membro` e `moderador`. Nunca concede `admin`, nunca muda o
// próprio papel nem o de outro administrador. O papel do alvo e o do ator são lidos do banco sob a transação.
export async function mudarPapelUsuario(
  deps: DependenciasModeracao,
  ator: Ator,
  usuarioAlvo: string,
  entrada: { papel: "membro" | "moderador"; motivo: string },
): Promise<UsuarioComPapel> {
  if (ator.papel !== "admin") throw new ErroApi("sem_permissao");
  const agora = deps.agora();
  const [existe] = await deps.db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.usuario, usuarioAlvo));
  if (!existe) throw new ErroApi("nao_encontrado", "Usuário não encontrado.");
  await consumirLimite(deps.db, LIMITES.moderacaoAgir, ator.id, agora);

  return deps.db.transaction(async (tx) => {
    const [quemAge] = await tx.select({ papel: usuarios.papel }).from(usuarios).where(eq(usuarios.id, ator.id));
    if (!quemAge || quemAge.papel !== "admin") throw new ErroApi("sem_permissao");

    const [alvo] = await tx.select().from(usuarios).where(eq(usuarios.id, existe.id)).for("update");
    if (alvo.id === ator.id) throw new ErroApi("sem_permissao", "Você não pode alterar o próprio papel.");
    if (alvo.papel === "admin") throw new ErroApi("sem_permissao", "O papel de um administrador não pode ser alterado por aqui.");

    if (alvo.papel !== entrada.papel) {
      await tx.update(usuarios).set({ papel: entrada.papel, atualizadoEm: agora }).where(eq(usuarios.id, alvo.id));
      await registrarAuditoria(tx, {
        atorId: ator.id,
        acao: "usuario.papel",
        alvoTipo: "usuario",
        alvoId: alvo.id,
        antes: { papel: alvo.papel },
        depois: { papel: entrada.papel },
        motivo: entrada.motivo,
        criadoEm: agora,
      });
    }
    return { usuario: alvo.usuario, nome: alvo.nome, papel: entrada.papel };
  });
}

