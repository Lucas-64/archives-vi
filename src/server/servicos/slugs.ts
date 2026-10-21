import { eq, sql } from "drizzle-orm";

import type { Banco } from "../db/cliente";
import { investigacoes, publicacoes } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { comSufixoAleatorio, slugDoTitulo } from "../publicacoes/slug";

// Banco ou transação: as duas expõem a mesma API de consulta.
export type Executor = Pick<Banco, "select" | "insert" | "update" | "delete" | "execute">;

const TENTATIVAS = 5;

// Publicações e investigações dividem uma única regra de slug: mesma geração (título sem acentos, hifens,
// até 60 caracteres, sufixo aleatório na colisão) e um único espaço de nomes. O bloqueio consultivo por slug
// vale até o fim da transação, então duas criações (de qualquer um dos dois tipos) com o mesmo slug se
// serializam: a segunda enxerga a primeira já gravada e escolhe outro sufixo. As restrições UNIQUE de cada
// tabela continuam como segunda barreira.
export async function escolherSlugLivre(tx: Executor, titulo: string): Promise<string> {
  const base = slugDoTitulo(titulo);
  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    const slug = tentativa === 0 ? base : comSufixoAleatorio(base);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`slug:${slug}`}, 0))`);
    const [publicacao] = await tx.select({ id: publicacoes.id }).from(publicacoes).where(eq(publicacoes.slug, slug)).limit(1);
    const [investigacao] = await tx.select({ id: investigacoes.id }).from(investigacoes).where(eq(investigacoes.slug, slug)).limit(1);
    if (!publicacao && !investigacao) return slug;
  }
  throw new ErroApi("conflito", "Não foi possível gerar um endereço para o título. Tente novamente.");
}
