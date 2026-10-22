// SEED DE DEMONSTRAÇÃO dos mistérios. Uso (veja docs/backend/README.md):
//   npm run seed:demonstracao-misterios -- --confirmar
// Cria um mistério de cada classificação da interface (src/constants/classificacoesMisterio.ts), só para
// validar as cores e os filtros. Os dados são fictícios e o autor é uma conta marcada como `demonstrativo`.
// Usa só DATABASE_URL. Não roda em migração, build, instalação nem rota, e RECUSA rodar em NODE_ENV=production.
// É idempotente: o que já existe (mesmo slug) é mantido. Para remover, resete o banco de desenvolvimento.
import { randomBytes } from "node:crypto";

import { eq, inArray } from "drizzle-orm";

import { hashSenha } from "../auth/senha";
import { criarConexao, type Banco } from "../db/cliente";
import { investigacaoHistorico, investigacoes, usuarios } from "../db/esquema";
import type { CategoriaInvestigacao, StatusInvestigacao } from "../db/esquema";

export const AUTOR_DEMONSTRACAO = "autor_demonstracao";

interface MisterioDemonstracao {
  slug: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaInvestigacao;
  status: StatusInvestigacao;
  localizacao: string;
  hipotese: string;
  perguntaCentral: string;
  // Classificação esperada na interface (regra de status + exceção provisória por slug).
  classificacaoEsperada: string;
}

export const MISTERIOS_DEMONSTRACAO: readonly MisterioDemonstracao[] = [
  {
    slug: "leonida-radio-loop",
    titulo: "Loop incomum na Frequência 99.1",
    descricao:
      "Um sinal curto, parecido com rádio, parece se repetir em trechos de áudio da comunidade e levanta dúvidas sobre uma transmissão escondida.",
    categoria: "broadcast",
    status: "community",
    localizacao: "Leonida",
    hipotese: "[Demonstração] O loop seria uma referência intencional deixada pelos desenvolvedores na rádio.",
    perguntaCentral: "O loop da Frequência 99.1 é intencional?",
    classificacaoEsperada: "Easter egg",
  },
  {
    slug: "downtown-mural-symbols",
    titulo: "Padrão de símbolos no mural do centro",
    descricao:
      "Investigadores notaram símbolos repetidos em uma sequência de mural que podem se relacionar a locais mostrados em imagens promocionais separadas.",
    categoria: "symbol",
    status: "classified",
    localizacao: "Centro de Leonida",
    hipotese: "[Demonstração] Os símbolos do mural se relacionam a locais de imagens promocionais separadas.",
    perguntaCentral: "Os símbolos do mural apontam para outros locais?",
    classificacaoEsperada: "Em andamento",
  },
  {
    slug: "airport-runway-markings",
    titulo: "Marcações da pista ao entardecer",
    descricao:
      "Marcações repetidas na pista, vistas em imagens do entardecer, podem indicar uma referência de navegação escondida ou apenas um detalhe inspirado no mundo real.",
    categoria: "location",
    status: "community",
    localizacao: "Aeroporto Internacional de Leonida",
    hipotese: "[Demonstração] As marcações são apenas um detalhe inspirado em pistas reais.",
    perguntaCentral: "As marcações da pista escondem alguma referência?",
    classificacaoEsperada: "Curiosidade",
  },
  {
    slug: "everglades-bunker-rumor",
    titulo: "Bunker escondido perto dos pântanos",
    descricao:
      "Uma teoria popular no mapa sugere uma estrutura oculta perto dos pântanos, mas as evidências visuais atuais são inconclusivas.",
    categoria: "location",
    status: "debunked",
    localizacao: "Pântanos de Leonida",
    hipotese: "[Demonstração] Existiria um bunker oculto perto dos pântanos, o que as imagens não confirmam.",
    perguntaCentral: "Existe um bunker escondido nos pântanos?",
    classificacaoEsperada: "Resolvido",
  },
];

export interface ResultadoSeed {
  criados: string[];
  jaExistiam: string[];
}

export async function semearMisteriosDemonstracao(db: Banco): Promise<ResultadoSeed> {
  return db.transaction(async (tx) => {
    let [autor] = await tx.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.usuario, AUTOR_DEMONSTRACAO));
    if (!autor) {
      // Senha aleatória descartada: a conta de demonstração não serve para entrar.
      const senhaHash = await hashSenha(randomBytes(24).toString("base64url"));
      [autor] = await tx
        .insert(usuarios)
        .values({
          usuario: AUTOR_DEMONSTRACAO,
          email: `${AUTOR_DEMONSTRACAO}@exemplo.invalid`,
          senhaHash,
          nome: "Autor de demonstração",
          bio: "Conta fictícia criada pelo seed de demonstração.",
          demonstrativo: true,
        })
        .returning({ id: usuarios.id });
    }

    const existentes = new Set(
      (
        await tx
          .select({ slug: investigacoes.slug })
          .from(investigacoes)
          .where(inArray(investigacoes.slug, MISTERIOS_DEMONSTRACAO.map((m) => m.slug)))
      ).map((l) => l.slug),
    );

    const resultado: ResultadoSeed = { criados: [], jaExistiam: [] };
    for (const m of MISTERIOS_DEMONSTRACAO) {
      if (existentes.has(m.slug)) {
        resultado.jaExistiam.push(m.slug);
        continue;
      }
      const [linha] = await tx
        .insert(investigacoes)
        .values({
          slug: m.slug,
          titulo: m.titulo,
          descricao: m.descricao,
          categoria: m.categoria,
          status: m.status,
          localizacao: m.localizacao,
          hipotese: m.hipotese,
          perguntaCentral: m.perguntaCentral,
          autorId: autor.id,
        })
        .returning({ id: investigacoes.id });
      await tx.insert(investigacaoHistorico).values({
        investigacaoId: linha.id,
        autorId: autor.id,
        tipo: "criada",
        titulo: "Mistério de demonstração criado",
        resumo: "Registro fictício criado pelo seed de demonstração.",
      });
      resultado.criados.push(m.slug);
    }
    return resultado;
  });
}

async function principal(argv: string[], env: Record<string, string | undefined>): Promise<number> {
  if (env.NODE_ENV === "production") {
    process.stderr.write("Recusado: o seed de demonstração não roda em produção.\n");
    return 1;
  }
  if (!env.DATABASE_URL) {
    process.stderr.write("Defina DATABASE_URL.\n");
    return 2;
  }
  if (!argv.includes("--confirmar")) {
    process.stderr.write(
      "Este script grava dados fictícios no banco de DATABASE_URL. Confirme com --confirmar (use um banco de desenvolvimento ou descartável).\n",
    );
    return 5;
  }
  const conexao = criarConexao(env.DATABASE_URL, { max: 2 });
  try {
    const r = await semearMisteriosDemonstracao(conexao.db);
    process.stdout.write(`Criados: ${r.criados.join(", ") || "nenhum"}. Já existiam: ${r.jaExistiam.join(", ") || "nenhum"}.\n`);
    return 0;
  } catch (erro) {
    // Só o nome do erro: a mensagem pode conter trechos de consulta ou da conexão.
    process.stderr.write(`Falha inesperada (${erro instanceof Error ? erro.name : "erro"}). Nada foi confirmado.\n`);
    return 1;
  } finally {
    await conexao.pool.end();
  }
}

// Só roda como script, nunca ao ser importado.
const executadoDiretamente = process.argv[1]?.replace(/\\/g, "/").endsWith("/cli/seedDemonstracaoMisterios.ts");
if (executadoDiretamente) {
  principal(process.argv.slice(2), process.env).then(
    (codigo) => process.exit(codigo),
    () => process.exit(1),
  );
}
