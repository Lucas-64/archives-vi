import path from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import type { Banco } from "./cliente";

export const PASTA_MIGRACOES = path.join(process.cwd(), "drizzle");

// Aplica as migrações versionadas em `drizzle/`. Idempotente: o que já foi aplicado é ignorado.
export async function aplicarMigracoes(db: Banco): Promise<void> {
  await migrate(db, { migrationsFolder: PASTA_MIGRACOES });
}
