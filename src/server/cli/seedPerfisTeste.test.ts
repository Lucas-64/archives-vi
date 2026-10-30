import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { entrar } from "../servicos/auth";
import { comentarios, curtidas, evidencias, investigacoes, publicacoes, usuarios } from "../db/esquema";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import {
  COMENTARIOS_TESTE,
  CURTIDAS_TESTE,
  hostDaUrl,
  INVESTIGACOES_TESTE,
  PERFIS_TESTE,
  principal,
  PUBLICACOES_TESTE,
  semearPerfisTeste,
} from "./seedPerfisTeste";

const BARATO = { N: 1024, r: 8, p: 1 };
const SENHA = "senha-de-teste-do-seed";
let b: BancoDeTeste;

beforeAll(async () => {
  b = await criarBancoDeTeste();
});
afterAll(async () => {
  await b.encerrar();
});

describe("seed de perfis de teste", () => {
  it("cria o esperado, é idempotente e marca contas como demonstrativas", async () => {
    const primeira = await semearPerfisTeste(b.db, SENHA, BARATO);
    expect(primeira).toEqual({
      usuarios: 10,
      investigacoes: INVESTIGACOES_TESTE.length,
      evidencias: 1,
      publicacoes: PUBLICACOES_TESTE.length,
      comentarios: COMENTARIOS_TESTE.length,
      curtidas: CURTIDAS_TESTE.length,
    });
    const segunda = await semearPerfisTeste(b.db, SENHA, BARATO);
    expect(Object.values(segunda).every((n) => n === 0)).toBe(true);

    const contas = await b.db.select().from(usuarios);
    expect(contas).toHaveLength(10);
    expect(contas.every((c) => c.demonstrativo && c.senhaHash.startsWith("scrypt$"))).toBe(true);
    expect(await b.db.select().from(investigacoes)).toHaveLength(2);
    expect(await b.db.select().from(publicacoes)).toHaveLength(20);
    // Toda conta de teste tem ao menos 2 publicações (teoria ou investigação).
    for (const p of PERFIS_TESTE) {
      expect(PUBLICACOES_TESTE.filter((x) => x.autor === p.usuario).length).toBeGreaterThanOrEqual(2);
    }
    expect(await b.db.select().from(comentarios)).toHaveLength(7);
    expect(await b.db.select().from(curtidas)).toHaveLength(6);
    const [evidencia] = await b.db.select().from(evidencias);
    expect(evidencia.status).toBe("aceita");
  });

  it("permite entrar nas 10 contas e recusa senha errada", async () => {
    const deps = { db: b.db, agora: () => new Date(), parametrosSenha: BARATO };
    for (const p of PERFIS_TESTE) {
      const email = `${p.usuario}@exemplo.invalid`;
      const ok = await entrar(deps, { email, senha: SENHA }, { ip: `10.0.0.${PERFIS_TESTE.indexOf(p) + 1}`, agente: null });
      expect(ok.usuario.usuario).toBe(p.usuario);
      await expect(entrar(deps, { email, senha: "errada-errada" }, { ip: "10.0.1.1", agente: null })).rejects.toThrow();
    }
  });
});

describe("guardas da linha de comando", () => {
  const base = { DATABASE_URL: "postgresql://u:s@127.0.0.1:5432/x" };
  it("aborta sem SEED_SENHA_PERFIS", async () => {
    expect(await principal(["--confirmar"], base)).toBe(2);
  });
  it("não grava sem --confirmar", async () => {
    expect(await principal([], { ...base, SEED_SENHA_PERFIS: "x" })).toBe(5);
  });
  it("exige --host-esperado em banco remoto e recusa host diferente", async () => {
    const remoto = { DATABASE_URL: "postgresql://u:s@db.exemplo.invalid/x", SEED_SENHA_PERFIS: "x" };
    expect(await principal(["--confirmar"], remoto)).toBe(5);
    expect(await principal(["--confirmar", "--host-esperado", "outro.invalid"], remoto)).toBe(5);
  });
  it("recusa produção e extrai o host", async () => {
    expect(await principal(["--confirmar"], { ...base, SEED_SENHA_PERFIS: "x", NODE_ENV: "production" })).toBe(1);
    expect(hostDaUrl(base.DATABASE_URL)).toBe("127.0.0.1");
  });
});
