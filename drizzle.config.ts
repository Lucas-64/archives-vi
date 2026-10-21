import { defineConfig } from "drizzle-kit";

// O drizzle-kit não lê .env.local sozinho. Carrega aqui, sem dependência extra (Node 20.12+).
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sem .env.local, vale o ambiente do shell.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/esquema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
