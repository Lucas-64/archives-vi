// Apoio de testes: cada suíte recebe um banco PostgreSQL descartável, criado no servidor indicado por
// TEST_DATABASE_URL, migrado do zero e apagado no fim. Sem TEST_DATABASE_URL o teste FALHA, com instrução,
// em vez de ser ignorado: um teste de banco que "passa" sem banco esconderia erros.
import { randomBytes } from "node:crypto";

import { Pool } from "pg";

import { criarConexao, type Banco } from "../db/cliente";
import { aplicarMigracoes } from "../db/migrar";

export interface BancoDeTeste {
  db: Banco;
  pool: Pool;
  nome: string;
  encerrar: () => Promise<void>;
}

function urlAdmin(): URL {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "Defina TEST_DATABASE_URL (servidor PostgreSQL local com papel CREATEDB). Veja .env.example e docs/backend/README.md.",
    );
  }
  return new URL(url);
}

export async function criarBancoDeTeste(opcoes: { migrar?: boolean } = {}): Promise<BancoDeTeste> {
  const admin = urlAdmin();
  const nome = `archives_teste_${randomBytes(6).toString("hex")}`;

  const poolAdmin = new Pool({ connectionString: admin.toString(), max: 1 });
  await poolAdmin.query(`create database "${nome}"`);
  await poolAdmin.end();

  const urlTeste = new URL(admin.toString());
  urlTeste.pathname = `/${nome}`;
  const { db, pool } = criarConexao(urlTeste.toString(), { max: 4 });
  if (opcoes.migrar !== false) await aplicarMigracoes(db);

  return {
    db,
    pool,
    nome,
    async encerrar() {
      await pool.end();
      const limpeza = new Pool({ connectionString: admin.toString(), max: 1 });
      try {
        await limpeza.query(`drop database if exists "${nome}" with (force)`);
      } finally {
        await limpeza.end();
      }
    },
  };
}

export { codigoPg } from "../db/erros";
