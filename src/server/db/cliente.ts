import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { obterEnv } from "../config/env";
import * as esquema from "./esquema";

export type Banco = NodePgDatabase<typeof esquema>;

export interface ConexaoBanco {
  db: Banco;
  pool: Pool;
}

export function criarConexao(url: string, opcoes: { max?: number } = {}): ConexaoBanco {
  const pool = new Pool({ connectionString: url, max: opcoes.max ?? 10 });
  return { db: drizzle({ client: pool, schema: esquema }), pool };
}

// Uma conexão por processo. O objeto global evita pools duplicados quando o Next recarrega módulos
// em desenvolvimento.
const global = globalThis as unknown as { __archivesConexao?: ConexaoBanco };

export function obterDb(): Banco {
  global.__archivesConexao ??= criarConexao(obterEnv().DATABASE_URL);
  return global.__archivesConexao.db;
}
