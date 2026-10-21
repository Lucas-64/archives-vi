import { and, eq, isNull, lt, or, gt } from "drizzle-orm";

import type { Banco } from "../db/cliente";
import { colunasUsuarioSemSenha, sessoes, usuarios } from "../db/esquema";
import { gerarToken, hashToken, tokenComFormatoValido } from "./token";

const DIA = 24 * 60 * 60 * 1000;
// Inatividade máxima (deslizante) e vida máxima absoluta da sessão.
export const INATIVIDADE_MAXIMA_MS = 30 * DIA;
export const VIDA_ABSOLUTA_MS = 90 * DIA;
// Para não gravar a cada requisição, o "último uso" só é renovado depois deste intervalo.
export const RENOVAR_APOS_MS = 5 * 60 * 1000;

export interface SessaoCriada {
  token: string;
  expiraAbsolutaEm: Date;
}

export async function criarSessao(
  db: Banco,
  usuarioId: string,
  opcoes: { agora?: Date; agente?: string | null } = {},
): Promise<SessaoCriada> {
  const agora = opcoes.agora ?? new Date();
  const token = gerarToken();
  const expiraAbsolutaEm = new Date(agora.getTime() + VIDA_ABSOLUTA_MS);
  await db.insert(sessoes).values({
    tokenHash: hashToken(token),
    usuarioId,
    criadoEm: agora,
    ultimoUsoEm: agora,
    expiraEm: new Date(agora.getTime() + INATIVIDADE_MAXIMA_MS),
    expiraAbsolutaEm,
    agente: opcoes.agente ? opcoes.agente.slice(0, 200) : null,
  });
  return { token, expiraAbsolutaEm };
}

// Devolve o usuário da sessão ou null (token malformado, desconhecido, revogado ou expirado). Renova a
// expiração deslizante, sem passar do limite absoluto.
export async function validarSessao(db: Banco, token: string, agora: Date = new Date()) {
  if (!tokenComFormatoValido(token)) return null;

  const [linha] = await db
    .select({ sessaoId: sessoes.id, ultimoUsoEm: sessoes.ultimoUsoEm, expiraAbsolutaEm: sessoes.expiraAbsolutaEm, usuario: colunasUsuarioSemSenha })
    .from(sessoes)
    .innerJoin(usuarios, eq(usuarios.id, sessoes.usuarioId))
    .where(
      and(
        eq(sessoes.tokenHash, hashToken(token)),
        isNull(sessoes.revogadaEm),
        gt(sessoes.expiraEm, agora),
        gt(sessoes.expiraAbsolutaEm, agora),
      ),
    );
  if (!linha) return null;

  if (agora.getTime() - linha.ultimoUsoEm.getTime() >= RENOVAR_APOS_MS) {
    const novaExpiracao = Math.min(agora.getTime() + INATIVIDADE_MAXIMA_MS, linha.expiraAbsolutaEm.getTime());
    await db.update(sessoes).set({ ultimoUsoEm: agora, expiraEm: new Date(novaExpiracao) }).where(eq(sessoes.id, linha.sessaoId));
  }
  return { sessaoId: linha.sessaoId, usuario: linha.usuario };
}

export async function revogarSessao(db: Banco, token: string, agora: Date = new Date()): Promise<void> {
  if (!tokenComFormatoValido(token)) return;
  await db
    .update(sessoes)
    .set({ revogadaEm: agora })
    .where(and(eq(sessoes.tokenHash, hashToken(token)), isNull(sessoes.revogadaEm)));
}

export async function revogarSessoesDoUsuario(db: Banco, usuarioId: string, agora: Date = new Date()): Promise<void> {
  await db.update(sessoes).set({ revogadaEm: agora }).where(and(eq(sessoes.usuarioId, usuarioId), isNull(sessoes.revogadaEm)));
}

// Remove sessões vencidas ou revogadas. Chamada por rotina de manutenção (ainda não agendada).
export async function removerSessoesInvalidas(db: Banco, agora: Date = new Date()): Promise<void> {
  await db
    .delete(sessoes)
    .where(or(lt(sessoes.expiraEm, agora), lt(sessoes.expiraAbsolutaEm, agora), lt(sessoes.revogadaEm, agora)));
}
