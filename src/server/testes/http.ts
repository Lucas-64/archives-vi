// Apoio de testes de rota: monta Requests como o navegador enviaria e registra membros reais pela API.
import { expect } from "vitest";

import type { criarManipuladoresAuth } from "../auth/rotas";

export const ORIGEM = "http://localhost:3000";
let seq = 0;
export const unico = () => `t${++seq}${Math.random().toString(36).slice(2, 6)}`;

export interface OpReq {
  corpo?: unknown;
  bruto?: string;
  cookie?: string;
  semCsrf?: boolean;
  origem?: string;
}

export function req(metodo: string, caminho: string, o: OpReq = {}) {
  const cab: Record<string, string> = { "x-forwarded-for": `10.9.${Math.floor(++seq / 250)}.${seq % 250}`, origin: o.origem ?? ORIGEM };
  if (!o.semCsrf) cab["x-requested-with"] = "archives-vi";
  if (o.cookie) cab.cookie = o.cookie;
  let body: string | undefined;
  if (o.bruto !== undefined) body = o.bruto;
  else if (o.corpo !== undefined) body = JSON.stringify(o.corpo);
  if (body !== undefined) cab["content-type"] = "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cab, body });
}

export async function registrarMembro(auth: ReturnType<typeof criarManipuladoresAuth>) {
  const id = unico();
  const r = await auth.cadastro(
    req("POST", "/api/v1/auth/cadastro", { corpo: { usuario: `membro_${id}`, email: `${id}@exemplo.com`, senha: "senha-de-teste-1" } }),
    undefined,
  );
  expect(r.status).toBe(201);
  const c = await r.json();
  return { cookie: (r.headers.get("set-cookie") ?? "").split(";")[0], usuario: `membro_${id}`, email: `${id}@exemplo.com`, id: c.usuario.id as string };
}
export type Membro = Awaited<ReturnType<typeof registrarMembro>>;
