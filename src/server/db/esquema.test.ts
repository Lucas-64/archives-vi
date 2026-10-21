import { readFileSync } from "node:fs";
import path from "node:path";

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { codigoPg, criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { PASTA_MIGRACOES, aplicarMigracoes } from "./migrar";
import { colunasUsuarioSemSenha, sessoes, usuarios, type NovoUsuario } from "./esquema";

let banco: BancoDeTeste;
let contador = 0;

function novoUsuario(sobrescrever: Partial<NovoUsuario> = {}): NovoUsuario {
  contador += 1;
  return {
    usuario: `membro_${contador}`,
    email: `membro${contador}@exemplo.com`,
    senhaHash: "hash-de-teste",
    nome: `Membro ${contador}`,
    ...sobrescrever,
  };
}

const DEZ_MINUTOS = 10 * 60 * 1000;
function dadosSessao(usuarioId: string, tokenHash: string) {
  const agora = Date.now();
  return {
    usuarioId,
    tokenHash,
    expiraEm: new Date(agora + DEZ_MINUTOS),
    expiraAbsolutaEm: new Date(agora + 2 * DEZ_MINUTOS),
  };
}

beforeAll(async () => {
  banco = await criarBancoDeTeste();
});

afterAll(async () => {
  await banco?.encerrar();
});

describe("migrações", () => {
  it("criam as tabelas a partir de um banco vazio", async () => {
    const { rows } = await banco.pool.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' order by 1",
    );
    const nomes = rows.map((linha) => linha.table_name);
    expect(nomes).toContain("usuarios");
    expect(nomes).toContain("sessoes");
    expect(nomes).toContain("limites_taxa");
  });

  it("são idempotentes: aplicar de novo não falha nem duplica", async () => {
    await aplicarMigracoes(banco.db);
    const { rows } = await banco.pool.query<{ total: string }>(
      "select count(*) as total from drizzle.__drizzle_migrations",
    );
    const diario = JSON.parse(readFileSync(path.join(PASTA_MIGRACOES, "meta", "_journal.json"), "utf8"));
    expect(Number(rows[0].total)).toBe(diario.entries.length);
  });
});

describe("usuarios", () => {
  it("aplica os padrões: papel membro, sem verificação de e-mail, não demonstrativo", async () => {
    const [criado] = await banco.db.insert(usuarios).values(novoUsuario()).returning();
    expect(criado.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(criado.papel).toBe("membro");
    expect(criado.bio).toBe("");
    expect(criado.emailVerificadoEm).toBeNull();
    expect(criado.demonstrativo).toBe(false);
  });

  it("rejeita usuario duplicado (23505)", async () => {
    await banco.db.insert(usuarios).values(novoUsuario({ usuario: "duplicado", email: "d1@exemplo.com" }));
    const tentativa = banco.db.insert(usuarios).values(novoUsuario({ usuario: "duplicado", email: "d2@exemplo.com" }));
    await expect(tentativa).rejects.toSatisfy((erro) => codigoPg(erro) === "23505");
  });

  it("rejeita e-mail duplicado (23505)", async () => {
    await banco.db.insert(usuarios).values(novoUsuario({ email: "igual@exemplo.com" }));
    const tentativa = banco.db.insert(usuarios).values(novoUsuario({ email: "igual@exemplo.com" }));
    await expect(tentativa).rejects.toSatisfy((erro) => codigoPg(erro) === "23505");
  });

  it.each([
    ["usuario com maiúscula", { usuario: "Maiuscula" }],
    ["usuario curto demais", { usuario: "ab" }],
    ["usuario com caractere inválido", { usuario: "com espaco" }],
    ["usuario longo demais", { usuario: "a".repeat(31) }],
    ["e-mail com maiúscula", { email: "Maiuscula@exemplo.com" }],
    ["e-mail sem domínio", { email: "sem-arroba" }],
    ["nome vazio", { nome: "" }],
    ["nome acima de 60", { nome: "n".repeat(61) }],
    ["bio acima de 240", { bio: "b".repeat(241) }],
    ["papel desconhecido", { papel: "superadmin" as never }],
  ])("rejeita %s (23514)", async (_descricao, dados) => {
    const tentativa = banco.db.insert(usuarios).values(novoUsuario(dados));
    await expect(tentativa).rejects.toSatisfy((erro) => codigoPg(erro) === "23514");
  });

  it("aceita os limites exatos (nome 60, bio 240, usuario 3 e 30)", async () => {
    await banco.db.insert(usuarios).values(novoUsuario({ nome: "n".repeat(60), bio: "b".repeat(240) }));
    await banco.db.insert(usuarios).values(novoUsuario({ usuario: "abc" }));
    await banco.db.insert(usuarios).values(novoUsuario({ usuario: "a".repeat(30) }));
  });

  it("colunasUsuarioSemSenha não inclui o hash da senha", async () => {
    expect(Object.keys(colunasUsuarioSemSenha)).not.toContain("senhaHash");
    const [criado] = await banco.db.insert(usuarios).values(novoUsuario()).returning({ id: usuarios.id });
    const [lido] = await banco.db.select(colunasUsuarioSemSenha).from(usuarios).where(eq(usuarios.id, criado.id));
    expect(lido).not.toHaveProperty("senhaHash");
  });
});

describe("sessoes", () => {
  it("guarda a sessão de um usuário e não aceita token_hash repetido", async () => {
    const [dono] = await banco.db.insert(usuarios).values(novoUsuario()).returning({ id: usuarios.id });
    await banco.db.insert(sessoes).values(dadosSessao(dono.id, "hash-unico"));
    const repetida = banco.db.insert(sessoes).values(dadosSessao(dono.id, "hash-unico"));
    await expect(repetida).rejects.toSatisfy((erro) => codigoPg(erro) === "23505");
  });

  it("rejeita sessão de usuário inexistente (23503)", async () => {
    const tentativa = banco.db
      .insert(sessoes)
      .values(dadosSessao("00000000-0000-4000-8000-000000000000", "hash-orfao"));
    await expect(tentativa).rejects.toSatisfy((erro) => codigoPg(erro) === "23503");
  });

  it("remove as sessões quando o usuário é removido", async () => {
    const [dono] = await banco.db.insert(usuarios).values(novoUsuario()).returning({ id: usuarios.id });
    await banco.db.insert(sessoes).values(dadosSessao(dono.id, "hash-cascata"));
    await banco.db.delete(usuarios).where(eq(usuarios.id, dono.id));
    const restantes = await banco.db.select().from(sessoes).where(eq(sessoes.tokenHash, "hash-cascata"));
    expect(restantes).toHaveLength(0);
  });

  it("começa não revogada e com datas preenchidas", async () => {
    const [dono] = await banco.db.insert(usuarios).values(novoUsuario()).returning({ id: usuarios.id });
    const [sessao] = await banco.db.insert(sessoes).values(dadosSessao(dono.id, "hash-padrao")).returning();
    expect(sessao.revogadaEm).toBeNull();
    expect(sessao.criadoEm).toBeInstanceOf(Date);
    expect(sessao.expiraAbsolutaEm.getTime()).toBeGreaterThan(sessao.expiraEm.getTime());
  });
});
