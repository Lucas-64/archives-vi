import { createHash } from "node:crypto";

import { sql } from "drizzle-orm";

import type { Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";

export interface RegraLimite {
  // Nome do grupo, por exemplo "entrar:ip".
  grupo: string;
  limite: number;
  janelaMs: number;
}

// A chave guardada é um hash do grupo e do identificador (IP, e-mail): nada pessoal em texto puro.
function chaveDe(grupo: string, identificador: string): string {
  return createHash("sha256").update(`${grupo}\u0000${identificador}`).digest("hex");
}

// Janela fixa, atômica (um único INSERT ... ON CONFLICT). Conta a tentativa e, se passou do limite,
// lança limite_excedido com Retry-After até o fim da janela. Janela fixa permite uma rajada no limite da
// virada; é aceitável aqui e simples de auditar.
export async function consumirLimite(
  db: Banco,
  regra: RegraLimite,
  identificador: string,
  agora: Date = new Date(),
): Promise<void> {
  const chave = chaveDe(regra.grupo, identificador);
  const janela = `${regra.janelaMs} milliseconds`;
  const resultado = await db.execute<{ contagem: number; janela_inicio: Date }>(sql`
    insert into limites_taxa (chave, janela_inicio, contagem)
    values (${chave}, ${agora}, 1)
    on conflict (chave) do update set
      contagem = case when limites_taxa.janela_inicio + ${janela}::interval <= ${agora}
                      then 1 else limites_taxa.contagem + 1 end,
      janela_inicio = case when limites_taxa.janela_inicio + ${janela}::interval <= ${agora}
                           then ${agora} else limites_taxa.janela_inicio end
    returning contagem, janela_inicio
  `);
  const linha = resultado.rows[0];
  if (linha.contagem > regra.limite) {
    const fim = new Date(linha.janela_inicio).getTime() + regra.janelaMs;
    throw new ErroApi("limite_excedido", undefined, { retryAfter: Math.max(1, (fim - agora.getTime()) / 1000) });
  }
}

export const LIMITES = {
  entrarIp: { grupo: "entrar:ip", limite: 5, janelaMs: 60_000 },
  entrarEmail: { grupo: "entrar:email", limite: 10, janelaMs: 60 * 60_000 },
  cadastroIp: { grupo: "cadastro:ip", limite: 5, janelaMs: 60_000 },
  cadastroEmail: { grupo: "cadastro:email", limite: 10, janelaMs: 60 * 60_000 },
  publicarMembro: { grupo: "publicar:membro", limite: 10, janelaMs: 60_000 },
  comentarMembro: { grupo: "comentar:membro", limite: 20, janelaMs: 60_000 },
  curtirMembro: { grupo: "curtir:membro", limite: 60, janelaMs: 60_000 },
  // Provisório (D-F): criar, editar, mudar estado e encerrar investigação.
  investigacaoMutarMembro: { grupo: "investigacao:mutar", limite: 20, janelaMs: 60_000 },
  // Provisórios (D-P): sugerir evidência e agir como responsável/moderação (decidir sugestão, mudar status ou papel).
  evidenciaEnviarMembro: { grupo: "evidencia:enviar", limite: 10, janelaMs: 60_000 },
  moderacaoAgir: { grupo: "moderacao:agir", limite: 30, janelaMs: 60_000 },
  // Provisório (Tarefa 8): editar o próprio perfil.
  perfilEditarMembro: { grupo: "perfil:editar", limite: 10, janelaMs: 60_000 },
} as const satisfies Record<string, RegraLimite>;

// IP do cliente para o limite por IP. Sem proxy confiável configurado (decisão de hospedagem, adiada),
// X-Forwarded-For pode ser forjado: o limite por e-mail é a proteção que não depende dele.
export function ipDaRequisicao(requisicao: Request): string {
  const encaminhado = requisicao.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || "desconhecido";
}
