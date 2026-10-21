// Leitura de criadores para a busca, pelo mesmo serviço de `GET /api/v1/criadores?q=` (ADR-029). A API só
// tem busca por texto em criadores (nome sem acento ou usuário). Publicações e investigações não têm `q`:
// a página filtra a primeira página da listagem (ver `src/app/(site)/buscar/page.tsx`).
import { cache } from "react";

import type { PerfilPublico } from "../contracts/usuarios";
import { obterDb } from "../db/cliente";
import { listarCriadores } from "../servicos/usuarios";
import { LIMITE_LISTA, type ListaLimitada } from "./usuarios";

export const criadoresDaBusca = cache(async (q: string): Promise<ListaLimitada<PerfilPublico>> => {
  const pagina = await listarCriadores(obterDb(), { q }, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
});
