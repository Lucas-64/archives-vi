import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ErroApi } from "./erros";
import { camposDoErro, lerCorpo, lerJson, validar, validarQuery } from "./validar";

const esquemaTeoria = z
  .object({
    titulo: z.string().trim().min(3, "O título precisa ter pelo menos 3 caracteres.").max(120),
    texto: z.string().trim().min(20, "O texto precisa ter pelo menos 20 caracteres."),
  })
  .strict();

function requisicao(corpo: BodyInit | null, cabecalhos: Record<string, string> = { "content-type": "application/json" }) {
  return new Request("http://localhost/api/v1/x", { method: "POST", body: corpo, headers: cabecalhos });
}

async function falha(promessaOuFn: Promise<unknown> | (() => unknown)): Promise<ErroApi> {
  try {
    await (typeof promessaOuFn === "function" ? promessaOuFn() : promessaOuFn);
  } catch (erro) {
    expect(erro).toBeInstanceOf(ErroApi);
    return erro as ErroApi;
  }
  throw new Error("Era esperado um ErroApi.");
}

describe("validar", () => {
  it("devolve os dados já transformados (trim)", () => {
    const dados = validar(esquemaTeoria, { titulo: "  Título  ", texto: "x".repeat(25) });
    expect(dados.titulo).toBe("Título");
  });

  it("falha com 422 e `campos` usando as mensagens do esquema", async () => {
    const erro = await falha(() => validar(esquemaTeoria, { titulo: "ab", texto: "curto" }));
    expect(erro.codigo).toBe("validacao");
    expect(erro.status).toBe(422);
    expect(erro.campos).toEqual({
      titulo: "O título precisa ter pelo menos 3 caracteres.",
      texto: "O texto precisa ter pelo menos 20 caracteres.",
    });
  });

  it("rejeita campos extras de esquemas strict(), um por campo", async () => {
    const erro = await falha(() =>
      validar(esquemaTeoria, { titulo: "Título", texto: "x".repeat(25), papel: "admin", outro: 1 }),
    );
    expect(erro.status).toBe(422);
    expect(erro.campos).toEqual({ papel: "Campo não permitido.", outro: "Campo não permitido." });
  });

  it("usa mensagens padrão em português quando o esquema não define", async () => {
    const erro = await falha(() => validar(z.object({ n: z.number() }), { n: "x" }));
    expect(erro.campos?.n).toBeTruthy();
    expect(erro.campos?.n).not.toMatch(/expected|received|Invalid/i);
  });

  it("problema na raiz usa a chave `_` e caminhos aninhados usam ponto", async () => {
    expect((await falha(() => validar(esquemaTeoria, "texto"))).campos).toHaveProperty("_");
    const aninhado = z.object({ a: z.object({ b: z.string() }) });
    expect((await falha(() => validar(aninhado, { a: {} }))).campos).toHaveProperty(["a.b"]);
  });

  it("guarda só a primeira mensagem de cada campo", () => {
    const esquema = z.object({ s: z.string().min(5, "primeira").regex(/^\d+$/, "segunda") });
    const resultado = esquema.safeParse({ s: "ab" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(camposDoErro(resultado.error)).toEqual({ s: "primeira" });
  });
});

describe("validarQuery", () => {
  it("lê parâmetros da URL", () => {
    const dados = validarQuery(z.object({ q: z.string() }), "http://localhost/x?q=vice");
    expect(dados.q).toBe("vice");
  });

  it("rejeita parâmetro ausente", async () => {
    const erro = await falha(() => validarQuery(z.object({ q: z.string("Informe a busca.") }), "http://localhost/x"));
    expect(erro.campos).toEqual({ q: "Informe a busca." });
  });
});

describe("lerJson", () => {
  it("lê um JSON válido", async () => {
    expect(await lerJson(requisicao('{"a":1}'))).toEqual({ a: 1 });
  });

  it("aceita content-type com charset", async () => {
    const req = requisicao('{"a":1}', { "content-type": "application/json; charset=utf-8" });
    expect(await lerJson(req)).toEqual({ a: 1 });
  });

  it("JSON malformado devolve 400", async () => {
    const erro = await falha(lerJson(requisicao("{nao e json")));
    expect(erro.codigo).toBe("requisicao_invalida");
    expect(erro.status).toBe(400);
  });

  it("corpo vazio ou ausente devolve 400", async () => {
    expect((await falha(lerJson(requisicao("")))).status).toBe(400);
    expect((await falha(lerJson(requisicao(null)))).status).toBe(400);
  });

  it("content-type diferente de JSON devolve 415", async () => {
    const erro = await falha(lerJson(requisicao("a=1", { "content-type": "application/x-www-form-urlencoded" })));
    expect(erro.codigo).toBe("tipo_nao_suportado");
    expect(erro.status).toBe(415);
    expect((await falha(lerJson(requisicao("{}", {})))).status).toBe(415);
  });

  it("corpo acima do limite devolve 413 corpo_grande", async () => {
    const erro = await falha(lerJson(requisicao(JSON.stringify({ a: "x".repeat(200) })), { limiteBytes: 100 }));
    expect(erro.codigo).toBe("corpo_grande");
    expect(erro.status).toBe(413);
  });

  it("aplica o limite lendo o corpo, mesmo sem Content-Length confiável", async () => {
    const grande = new TextEncoder().encode(JSON.stringify({ a: "x".repeat(500) }));
    const fluxo = new ReadableStream<Uint8Array>({
      start(controle) {
        for (let i = 0; i < grande.length; i += 50) controle.enqueue(grande.slice(i, i + 50));
        controle.close();
      },
    });
    const req = new Request("http://localhost/x", {
      method: "POST",
      body: fluxo,
      headers: { "content-type": "application/json", "content-length": "10" },
      // @ts-expect-error Node exige `duplex` para corpo em fluxo
      duplex: "half",
    });
    const erro = await falha(lerJson(req, { limiteBytes: 100 }));
    expect(erro.codigo).toBe("corpo_grande");
  });

  it("corpo exatamente no limite passa", async () => {
    const texto = '{"a":"bbb"}';
    expect(await lerJson(requisicao(texto), { limiteBytes: texto.length })).toEqual({ a: "bbb" });
  });

  it("bytes que não são UTF-8 válido devolvem 400", async () => {
    const erro = await falha(lerJson(requisicao(new Uint8Array([0x7b, 0xff, 0xfe, 0x7d]))));
    expect(erro.status).toBe(400);
  });
});

describe("lerCorpo", () => {
  it("lê e valida", async () => {
    const corpo = await lerCorpo(requisicao(JSON.stringify({ titulo: "Título", texto: "x".repeat(25) })), esquemaTeoria);
    expect(corpo.titulo).toBe("Título");
  });

  it("corpo válido em JSON, mas inválido no esquema, devolve 422", async () => {
    const erro = await falha(lerCorpo(requisicao(JSON.stringify({ titulo: "a" })), esquemaTeoria));
    expect(erro.status).toBe(422);
    expect(erro.campos).toHaveProperty("titulo");
  });
});
