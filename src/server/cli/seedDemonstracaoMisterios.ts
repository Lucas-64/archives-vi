// SEED DE DEMONSTRAÇÃO dos mistérios. Uso (veja docs/backend/README.md):
//   npm run seed:demonstracao-misterios -- --confirmar
// Cria um mistério de cada classificação (src/constants/classificacoesMisterio.ts), com investigações
// vinculadas de exemplo, só para validar as cores, os filtros e o vínculo. Os dados são fictícios e o autor é uma conta marcada como `demonstrativo`.
// Usa só DATABASE_URL. Não roda em migração, build, instalação nem rota, e RECUSA rodar em NODE_ENV=production.
// É idempotente: o que já existe (mesmo slug) é mantido. Para remover, resete o banco de desenvolvimento.
import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { hashSenha } from "../auth/senha";
import { criarConexao, type Banco } from "../db/cliente";
import { investigacaoHistorico, investigacoes, misterios, usuarios } from "../db/esquema";
import type { CategoriaInvestigacao, ClassificacaoMisterioApi } from "../db/esquema";

export const AUTOR_DEMONSTRACAO = "autor_demonstracao";

interface InvestigacaoDemonstracao {
  slug: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaInvestigacao;
  localizacao?: string;
  hipotese: string;
  perguntaCentral: string;
  encerrada?: boolean;
}

interface MisterioDemonstracao {
  slug: string;
  titulo: string;
  descricao: string;
  classificacao: ClassificacaoMisterioApi;
  investigacoes: readonly InvestigacaoDemonstracao[];
}

// Um mistério por classificação, cada um com investigações vinculadas de exemplo (D8). Tudo fictício e
// identificado como demonstração; o autor é a conta `autor_demonstracao`.
export const MISTERIOS_DEMONSTRACAO: readonly MisterioDemonstracao[] = [
  {
    slug: "leonida-radio-loop",
    titulo: "Loop incomum na Frequência 99.1",
    descricao:
      "Um sinal curto, parecido com rádio, parece se repetir em trechos de áudio da comunidade e levanta dúvidas sobre uma transmissão escondida.",
    classificacao: "easter-egg",
    investigacoes: [
      {
        slug: "leonida-radio-loop-origem-do-sinal",
        titulo: "Origem do sinal da Frequência 99.1",
        descricao: "[Demonstração] Investigação de exemplo sobre de onde viria o trecho repetido no áudio da rádio.",
        categoria: "broadcast",
        localizacao: "Leonida",
        hipotese: "[Demonstração] O loop seria uma referência intencional deixada pelos desenvolvedores na rádio.",
        perguntaCentral: "O loop da Frequência 99.1 é intencional?",
      },
    ],
  },
  {
    slug: "downtown-mural-symbols",
    titulo: "Padrão de símbolos no mural do centro",
    descricao:
      "Investigadores notaram símbolos repetidos em uma sequência de mural que podem se relacionar a locais mostrados em imagens promocionais separadas.",
    classificacao: "em-andamento",
    investigacoes: [
      {
        slug: "downtown-mural-symbols-mapa-de-locais",
        titulo: "Os símbolos do mural apontam para outros locais?",
        descricao: "[Demonstração] Investigação de exemplo que compara os símbolos do mural com locais de imagens promocionais.",
        categoria: "symbol",
        localizacao: "Centro de Leonida",
        hipotese: "[Demonstração] Os símbolos do mural se relacionam a locais de imagens promocionais separadas.",
        perguntaCentral: "Os símbolos do mural apontam para outros locais?",
      },
      {
        slug: "downtown-mural-symbols-ordem-da-sequencia",
        titulo: "A ordem da sequência do mural importa?",
        descricao: "[Demonstração] Investigação de exemplo, já encerrada pelo autor, sobre a ordem dos símbolos.",
        categoria: "symbol",
        hipotese: "[Demonstração] A ordem dos símbolos seguiria a ordem de aparição nas imagens promocionais.",
        perguntaCentral: "Existe uma ordem intencional nos símbolos?",
        encerrada: true,
      },
    ],
  },
  {
    slug: "airport-runway-markings",
    titulo: "Marcações da pista ao entardecer",
    descricao:
      "Marcações repetidas na pista, vistas em imagens do entardecer, podem indicar uma referência de navegação escondida ou apenas um detalhe inspirado no mundo real.",
    classificacao: "curiosidade",
    investigacoes: [],
  },
  {
    slug: "everglades-bunker-rumor",
    titulo: "Bunker escondido perto dos pântanos",
    descricao:
      "Uma teoria popular no mapa sugere uma estrutura oculta perto dos pântanos, mas as evidências visuais atuais foram analisadas e explicadas.",
    classificacao: "resolvido",
    investigacoes: [
      {
        slug: "everglades-bunker-rumor-imagens-do-mapa",
        titulo: "As imagens do mapa mostram um bunker?",
        descricao: "[Demonstração] Investigação de exemplo, encerrada, que não encontrou prova de um bunker nos pântanos.",
        categoria: "location",
        localizacao: "Pântanos de Leonida",
        hipotese: "[Demonstração] Existiria um bunker oculto perto dos pântanos, o que as imagens não confirmam.",
        perguntaCentral: "Existe um bunker escondido nos pântanos?",
        encerrada: true,
      },
    ],
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

    const resultado: ResultadoSeed = { criados: [], jaExistiam: [] };
    for (const m of MISTERIOS_DEMONSTRACAO) {
      let [misterio] = await tx.select({ id: misterios.id }).from(misterios).where(eq(misterios.slug, m.slug));
      if (misterio) {
        resultado.jaExistiam.push(m.slug);
      } else {
        [misterio] = await tx
          .insert(misterios)
          .values({ slug: m.slug, titulo: m.titulo, descricao: m.descricao, classificacao: m.classificacao, autorId: autor.id })
          .returning({ id: misterios.id });
        resultado.criados.push(m.slug);
      }
      for (const i of m.investigacoes) {
        const [existe] = await tx.select({ id: investigacoes.id }).from(investigacoes).where(eq(investigacoes.slug, i.slug));
        if (existe) {
          resultado.jaExistiam.push(i.slug);
          continue;
        }
        const [linha] = await tx
          .insert(investigacoes)
          .values({
            slug: i.slug,
            titulo: i.titulo,
            descricao: i.descricao,
            categoria: i.categoria,
            localizacao: i.localizacao,
            hipotese: i.hipotese,
            perguntaCentral: i.perguntaCentral,
            encerradaPeloAutor: i.encerrada ?? false,
            misterioId: misterio.id,
            autorId: autor.id,
          })
          .returning({ id: investigacoes.id });
        await tx.insert(investigacaoHistorico).values({
          investigacaoId: linha.id,
          autorId: autor.id,
          tipo: "criada",
          titulo: "Investigação de demonstração criada",
          resumo: "Registro fictício criado pelo seed de demonstração.",
        });
        resultado.criados.push(i.slug);
      }
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
