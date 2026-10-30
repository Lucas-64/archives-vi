// SEED DE PERFIS DE TESTE (docs/backend/seed-perfis-teste.md). Uso:
//   SEED_SENHA_PERFIS=<senha> npm run seed:perfis-teste -- --confirmar
//   SEED_SENHA_PERFIS=<senha> npm run seed:perfis-teste -- --confirmar --host-esperado <host>   (banco remoto)
// Cria 10 contas fictícias (demonstrativo = true) com 2 mistérios, uma evidência, 20 publicações (2 por conta), comentários
// e curtidas, todos marcados como conteúdo de teste. A senha vem só de SEED_SENHA_PERFIS (sem valor padrão).
// Usa só DATABASE_URL e nunca a imprime. Em banco que não seja local, exige --host-esperado igual ao host da
// URL. É idempotente: a segunda execução não cria nada. RECUSA rodar em NODE_ENV=production.
import { and, eq, inArray } from "drizzle-orm";

import { hashSenha, PARAMETROS_PADRAO, type ParametrosScrypt } from "../auth/senha";
import { criarConexao, type Banco } from "../db/cliente";
import {
  comentarios,
  curtidas,
  evidencias,
  investigacaoHistorico,
  investigacaoTags,
  investigacoes,
  publicacaoTags,
  publicacaoTermos,
  publicacoes,
  usuarios,
} from "../db/esquema";
import type { CategoriaInvestigacao, IdTag, TipoPublicacao } from "../db/esquema";

export const DOMINIO_EMAIL_TESTE = "exemplo.invalid";
const AVISO = "Conteúdo fictício de teste, criado pelo seed de perfis.";

interface PerfilTeste {
  usuario: string;
  // Apelido original (alguns têm ponto, que o CHECK de `usuario` não aceita).
  nome: string;
  bio: string;
}

export const PERFIS_TESTE: readonly PerfilTeste[] = [
  { usuario: "pedro_rdr", nome: "pedro_rdr", bio: "Perfil fictício de teste. Gosta de seguir teias de pistas." },
  { usuario: "caio_exe", nome: "caio.exe", bio: "Perfil fictício de teste. Curioso com método de investigação." },
  { usuario: "vini_jpg", nome: "vini.jpg", bio: "Perfil fictício de teste. Comenta pouco e observa muito." },
  { usuario: "leo_clips", nome: "leo.clips", bio: "Perfil fictício de teste. Recorta trechos de trailers." },
  { usuario: "gui_trilhas", nome: "gui_trilhas", bio: "Perfil fictício de teste. Foca em trilhas e áudio." },
  { usuario: "arthurzin7", nome: "arthurzin7", bio: "Perfil fictício de teste." },
  { usuario: "marcoslima", nome: "marcoslima", bio: "Perfil fictício de teste." },
  { usuario: "rafael_1899", nome: "rafael_1899", bio: "Perfil fictício de teste." },
  { usuario: "brunofps", nome: "brunofps", bio: "Perfil fictício de teste." },
  { usuario: "gta6leaks999", nome: "gta6leaks999", bio: "Perfil fictício de teste." },
];

interface InvestigacaoTeste {
  slug: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaInvestigacao;
  hipotese: string;
  perguntaCentral: string;
  autor: string;
  tags: IdTag[];
}

export const INVESTIGACOES_TESTE: readonly InvestigacaoTeste[] = [
  {
    slug: "teste-teias-de-pistas",
    titulo: "Teias de pistas ligando os trailers",
    descricao: `${AVISO} Reúne pistas que parecem se conectar entre trechos de trailers diferentes.`,
    categoria: "symbol",
    hipotese: `${AVISO} Algumas pistas dos trailers formariam uma teia única de referências.`,
    perguntaCentral: "As pistas dos trailers formam uma teia conectada?",
    autor: "pedro_rdr",
    tags: ["teorias-conexoes", "simbolos-mensagens"],
  },
  {
    slug: "teste-pista-ou-coincidencia",
    titulo: "Como diferenciar uma pista de uma coincidência?",
    descricao: `${AVISO} Discute critérios simples para separar pistas reais de coincidências.`,
    categoria: "community-discovery",
    hipotese: `${AVISO} Pistas reais se repetem em fontes independentes; coincidências, não.`,
    perguntaCentral: "Que critério separa uma pista de uma coincidência?",
    autor: "caio_exe",
    tags: ["teorias-conexoes"],
  },
];

export const EVIDENCIA_TESTE = {
  investigacaoSlug: "teste-teias-de-pistas",
  autor: "gui_trilhas",
  aceitaPor: "pedro_rdr",
  titulo: "Trecho de áudio repetido em dois trailers",
  descricao: `${AVISO} Um trecho curto de áudio parece reaparecer em dois trailers diferentes.`,
} as const;

interface PublicacaoTeste {
  slug: string;
  titulo: string;
  resumo: string;
  tipo: TipoPublicacao;
  autor: string;
  tags: IdTag[];
  termos: string[];
}

export const PUBLICACOES_TESTE: readonly PublicacaoTeste[] = [
  { slug: "teste-sinal-no-radio", titulo: "Sinal estranho na rádio", resumo: "Teoria fictícia sobre um sinal curto na rádio.", tipo: "teoria", autor: "arthurzin7", tags: ["audio-transmissoes"], termos: ["rádio", "sinal"] },
  { slug: "teste-mapa-simbolos", titulo: "Símbolos repetidos no mapa", resumo: "Investigação fictícia sobre símbolos que se repetem no mapa.", tipo: "investigacao", autor: "marcoslima", tags: ["locais-mapas", "simbolos-mensagens"], termos: ["mapa"] },
  { slug: "teste-trilha-escondida", titulo: "Trilha escondida nos trailers", resumo: "Teoria fictícia sobre uma trilha sonora reaproveitada.", tipo: "teoria", autor: "gui_trilhas", tags: ["audio-transmissoes"], termos: ["trilha", "trailer"] },
  { slug: "teste-recortes-trailer", titulo: "Recortes quadro a quadro", resumo: "Investigação fictícia com recortes de quadros de trailers.", tipo: "investigacao", autor: "leo_clips", tags: ["easter-eggs-segredos"], termos: ["quadros"] },
  { slug: "teste-lenda-dos-pantanos", titulo: "A lenda dos pântanos", resumo: "Teoria fictícia sobre uma criatura nos pântanos.", tipo: "teoria", autor: "rafael_1899", tags: ["criaturas-lendas"], termos: ["pântano"] },
  { slug: "teste-desempenho-no-trailer", titulo: "Taxa de quadros e pistas", resumo: "Teoria fictícia sobre pistas ligadas à taxa de quadros.", tipo: "teoria", autor: "brunofps", tags: ["teorias-conexoes"], termos: ["fps"] },
  { slug: "teste-vazamento-duvidoso", titulo: "Um suposto vazamento duvidoso", resumo: "Publicação fictícia sobre um boato de vazamento sem fonte.", tipo: "teoria", autor: "gta6leaks999", tags: ["crimes-acontecimentos"], termos: ["boato"] },
  // Teorias de fã sobre Red Dead Redemption 2, escritas com palavras próprias. Todas fictícias e de teste.
  { slug: "teste-rdr2-plano-do-dutch", titulo: "O plano do Dutch era sempre o mesmo", resumo: "Teoria fictícia: cada plano \"de última hora\" do Dutch repete a mesma lógica e deixa o bando mais exposto.", tipo: "teoria", autor: "pedro_rdr", tags: ["teorias-conexoes"], termos: ["Dutch", "plano"] },
  { slug: "teste-rdr2-acampamento-como-mapa", titulo: "O acampamento como mapa do estado do bando", resumo: "Teoria fictícia: a arrumação do acampamento muda conforme o ânimo do grupo e funciona como um indicador escondido.", tipo: "teoria", autor: "pedro_rdr", tags: ["locais-mapas"], termos: ["acampamento"] },
  { slug: "teste-rdr2-diario-de-arthur", titulo: "O que o diário de Arthur deixa de dizer", resumo: "Teoria fictícia: os desenhos e as lacunas no diário sugerem lembranças que o personagem prefere não escrever.", tipo: "teoria", autor: "caio_exe", tags: ["simbolos-mensagens"], termos: ["diário", "Arthur"] },
  { slug: "teste-rdr2-estranho-da-cabana", titulo: "O homem estranho e a cabana isolada", resumo: "Teoria fictícia: os encontros com o homem estranho seguem um padrão ligado a lugares isolados do mapa.", tipo: "teoria", autor: "caio_exe", tags: ["criaturas-lendas"], termos: ["estranho", "cabana"] },
  { slug: "teste-rdr2-cavalo-que-reaparece", titulo: "O cavalo branco que aparece em lugares demais", resumo: "Teoria fictícia: um cavalo claro visto em regiões distantes pode ser uma pista deixada de propósito.", tipo: "teoria", autor: "vini_jpg", tags: ["easter-eggs-segredos"], termos: ["cavalo"] },
  { slug: "teste-rdr2-trem-fantasma", titulo: "O trem que passa fora do horário", resumo: "Teoria fictícia: um trem visto de madrugada, sem estação nem destino, esconderia uma referência a um evento antigo.", tipo: "teoria", autor: "vini_jpg", tags: ["crimes-acontecimentos"], termos: ["trem"] },
  { slug: "teste-rdr2-cancao-da-fogueira", titulo: "A canção da fogueira muda de verso", resumo: "Teoria fictícia: pequenas trocas na letra cantada à noite acompanham os capítulos e anunciam mudanças.", tipo: "teoria", autor: "leo_clips", tags: ["audio-transmissoes"], termos: ["canção", "fogueira"] },
  { slug: "teste-rdr2-ilha-e-o-naufragio", titulo: "A ilha e o naufrágio que ninguém explica", resumo: "Teoria fictícia: os destroços numa ilha remota combinam com histórias contadas por moradores de outra região.", tipo: "teoria", autor: "gui_trilhas", tags: ["locais-mapas", "criaturas-lendas"], termos: ["ilha", "naufrágio"] },
  { slug: "teste-rdr2-retrato-na-parede", titulo: "O retrato na parede de uma casa abandonada", resumo: "Teoria fictícia: um retrato quase apagado numa casa vazia retrata alguém que aparece mais tarde na história.", tipo: "teoria", autor: "arthurzin7", tags: ["simbolos-mensagens"], termos: ["retrato", "casa"] },
  { slug: "teste-rdr2-rota-do-cacador", titulo: "A rota do caçador de recompensas", resumo: "Teoria fictícia: os cartazes de procurado seguem uma rota que desenha uma figura quando ligamos os pontos.", tipo: "teoria", autor: "marcoslima", tags: ["locais-mapas", "teorias-conexoes"], termos: ["cartaz", "rota"] },
  { slug: "teste-rdr2-sino-da-igreja", titulo: "O sino da igreja que toca sozinho", resumo: "Teoria fictícia: o sino ouvido em uma vila vazia teria relação com uma promessa feita por um personagem do bando.", tipo: "teoria", autor: "rafael_1899", tags: ["audio-transmissoes"], termos: ["sino", "igreja"] },
  { slug: "teste-rdr2-mapa-do-tesouro-falso", titulo: "Os mapas do tesouro que levam ao mesmo lugar", resumo: "Teoria fictícia: dois mapas aparentemente diferentes apontam para o mesmo local e podem ser pistas de uma só história.", tipo: "teoria", autor: "brunofps", tags: ["easter-eggs-segredos", "locais-mapas"], termos: ["tesouro", "mapa"] },
  { slug: "teste-rdr2-boato-do-final-alternativo", titulo: "O boato do final alternativo", resumo: "Teoria fictícia sobre um boato de final escondido que circula sem prova nenhuma, usada como exemplo de fonte fraca.", tipo: "teoria", autor: "gta6leaks999", tags: ["crimes-acontecimentos"], termos: ["boato", "final"] },
];

// 7 comentários em 5 publicações. vini_jpg comenta uma vez; pedro_rdr não comenta.
export const COMENTARIOS_TESTE: readonly { slug: string; autor: string; texto: string }[] = [
  { slug: "teste-sinal-no-radio", autor: "caio_exe", texto: "Comentário fictício de teste: o sinal parece mesmo repetir." },
  { slug: "teste-sinal-no-radio", autor: "leo_clips", texto: "Comentário fictício de teste: ouvi algo parecido em outro trecho." },
  { slug: "teste-mapa-simbolos", autor: "gui_trilhas", texto: "Comentário fictício de teste: vale comparar com o mapa antigo." },
  { slug: "teste-trilha-escondida", autor: "vini_jpg", texto: "Comentário fictício de teste: boa observação sobre a trilha." },
  { slug: "teste-trilha-escondida", autor: "arthurzin7", texto: "Comentário fictício de teste: concordo com a ligação." },
  { slug: "teste-lenda-dos-pantanos", autor: "marcoslima", texto: "Comentário fictício de teste: falta uma fonte para isso." },
  { slug: "teste-vazamento-duvidoso", autor: "brunofps", texto: "Comentário fictício de teste: sem fonte, não dá para confiar." },
];

export const CURTIDAS_TESTE: readonly { slug: string; autor: string }[] = [
  { slug: "teste-sinal-no-radio", autor: "caio_exe" },
  { slug: "teste-sinal-no-radio", autor: "pedro_rdr" },
  { slug: "teste-mapa-simbolos", autor: "gui_trilhas" },
  { slug: "teste-trilha-escondida", autor: "vini_jpg" },
  { slug: "teste-lenda-dos-pantanos", autor: "leo_clips" },
  { slug: "teste-recortes-trailer", autor: "pedro_rdr" },
];

export interface ResultadoSeedPerfis {
  usuarios: number;
  investigacoes: number;
  evidencias: number;
  publicacoes: number;
  comentarios: number;
  curtidas: number;
}

export async function semearPerfisTeste(db: Banco, senha: string, parametros: ParametrosScrypt = PARAMETROS_PADRAO): Promise<ResultadoSeedPerfis> {
  return db.transaction(async (tx) => {
    const r: ResultadoSeedPerfis = { usuarios: 0, investigacoes: 0, evidencias: 0, publicacoes: 0, comentarios: 0, curtidas: 0 };

    const idUsuario = new Map<string, string>();
    const existentes = await tx
      .select({ id: usuarios.id, usuario: usuarios.usuario })
      .from(usuarios)
      .where(inArray(usuarios.usuario, PERFIS_TESTE.map((p) => p.usuario)));
    for (const e of existentes) idUsuario.set(e.usuario, e.id);
    for (const p of PERFIS_TESTE) {
      if (idUsuario.has(p.usuario)) continue;
      const [linha] = await tx
        .insert(usuarios)
        .values({
          usuario: p.usuario,
          email: `${p.usuario}@${DOMINIO_EMAIL_TESTE}`,
          senhaHash: await hashSenha(senha, parametros),
          nome: p.nome,
          bio: p.bio,
          demonstrativo: true,
        })
        .returning({ id: usuarios.id });
      idUsuario.set(p.usuario, linha.id);
      r.usuarios += 1;
    }
    const uid = (nome: string): string => {
      const id = idUsuario.get(nome);
      if (!id) throw new Error(`perfil ausente: ${nome}`);
      return id;
    };

    const idInvestigacao = new Map<string, string>();
    for (const i of INVESTIGACOES_TESTE) {
      const [existente] = await tx.select({ id: investigacoes.id }).from(investigacoes).where(eq(investigacoes.slug, i.slug));
      if (existente) {
        idInvestigacao.set(i.slug, existente.id);
        continue;
      }
      const [linha] = await tx
        .insert(investigacoes)
        .values({
          slug: i.slug,
          titulo: i.titulo,
          descricao: i.descricao,
          categoria: i.categoria,
          hipotese: i.hipotese,
          perguntaCentral: i.perguntaCentral,
          autorId: uid(i.autor),
        })
        .returning({ id: investigacoes.id });
      idInvestigacao.set(i.slug, linha.id);
      await tx.insert(investigacaoTags).values(i.tags.map((tagId) => ({ investigacaoId: linha.id, tagId })));
      await tx.insert(investigacaoHistorico).values({
        investigacaoId: linha.id,
        autorId: uid(i.autor),
        tipo: "criada",
        titulo: "Investigação de teste criada",
        resumo: AVISO,
      });
      r.investigacoes += 1;
    }

    const ev = EVIDENCIA_TESTE;
    const investigacaoEvidenciaId = idInvestigacao.get(ev.investigacaoSlug);
    if (!investigacaoEvidenciaId) throw new Error("investigação da evidência ausente");
    const [evidenciaExistente] = await tx
      .select({ id: evidencias.id })
      .from(evidencias)
      .where(and(eq(evidencias.investigacaoId, investigacaoEvidenciaId), eq(evidencias.autorId, uid(ev.autor)), eq(evidencias.titulo, ev.titulo)));
    if (!evidenciaExistente) {
      await tx.insert(evidencias).values({
        investigacaoId: investigacaoEvidenciaId,
        autorId: uid(ev.autor),
        origem: "referencia_textual",
        titulo: ev.titulo,
        descricao: ev.descricao,
        status: "aceita",
        decididaPorId: uid(ev.aceitaPor),
        decididaEm: new Date(),
      });
      await tx.insert(investigacaoHistorico).values({
        investigacaoId: investigacaoEvidenciaId,
        autorId: uid(ev.aceitaPor),
        tipo: "evidencia",
        titulo: "Evidência de teste aceita",
        resumo: AVISO,
      });
      r.evidencias += 1;
    }

    const idPublicacao = new Map<string, string>();
    for (const p of PUBLICACOES_TESTE) {
      const [existente] = await tx.select({ id: publicacoes.id }).from(publicacoes).where(eq(publicacoes.slug, p.slug));
      if (existente) {
        idPublicacao.set(p.slug, existente.id);
        continue;
      }
      const [linha] = await tx
        .insert(publicacoes)
        .values({ slug: p.slug, titulo: p.titulo, resumo: p.resumo, corpo: AVISO, tipo: p.tipo, autorId: uid(p.autor) })
        .returning({ id: publicacoes.id });
      idPublicacao.set(p.slug, linha.id);
      await tx.insert(publicacaoTags).values(p.tags.map((tagId) => ({ publicacaoId: linha.id, tagId })));
      await tx.insert(publicacaoTermos).values(p.termos.map((termo, ordem) => ({ publicacaoId: linha.id, ordem, termo })));
      r.publicacoes += 1;
    }
    const pid = (slug: string): string => {
      const id = idPublicacao.get(slug);
      if (!id) throw new Error(`publicação ausente: ${slug}`);
      return id;
    };

    for (const c of COMENTARIOS_TESTE) {
      const [existente] = await tx
        .select({ id: comentarios.id })
        .from(comentarios)
        .where(and(eq(comentarios.publicacaoId, pid(c.slug)), eq(comentarios.autorId, uid(c.autor)), eq(comentarios.texto, c.texto)));
      if (existente) continue;
      await tx.insert(comentarios).values({ publicacaoId: pid(c.slug), autorId: uid(c.autor), texto: c.texto });
      r.comentarios += 1;
    }

    for (const c of CURTIDAS_TESTE) {
      const inseridas = await tx
        .insert(curtidas)
        .values({ publicacaoId: pid(c.slug), usuarioId: uid(c.autor) })
        .onConflictDoNothing()
        .returning({ usuarioId: curtidas.usuarioId });
      r.curtidas += inseridas.length;
    }

    return r;
  });
}

const HOSTS_LOCAIS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function hostDaUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function valorDe(argv: string[], nome: string): string | undefined {
  const i = argv.indexOf(nome);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  return v === undefined || v.startsWith("--") ? undefined : v;
}

export async function principal(argv: string[], env: Record<string, string | undefined>): Promise<number> {
  if (env.NODE_ENV === "production") {
    process.stderr.write("Recusado: o seed de perfis de teste não roda em produção.\n");
    return 1;
  }
  if (!env.SEED_SENHA_PERFIS) {
    process.stderr.write("Defina SEED_SENHA_PERFIS com a senha das contas de teste. Não há valor padrão.\n");
    return 2;
  }
  if (!env.DATABASE_URL) {
    process.stderr.write("Defina DATABASE_URL.\n");
    return 2;
  }
  if (argv.some((a) => a === "--senha" || a.startsWith("--senha="))) {
    process.stderr.write("A senha não pode ser passada na linha de comando. Use SEED_SENHA_PERFIS.\n");
    return 2;
  }
  if (!argv.includes("--confirmar")) {
    process.stderr.write("Este script grava dados fictícios no banco de DATABASE_URL. Confirme com --confirmar (use um banco de desenvolvimento ou descartável).\n");
    return 5;
  }
  const host = hostDaUrl(env.DATABASE_URL);
  if (!host) {
    process.stderr.write("DATABASE_URL inválida.\n");
    return 2;
  }
  if (!HOSTS_LOCAIS.has(host)) {
    const esperado = valorDe(argv, "--host-esperado")?.toLowerCase();
    if (!esperado) {
      process.stderr.write("O banco não é local: informe --host-esperado <host> junto com --confirmar.\n");
      return 5;
    }
    if (esperado !== host) {
      process.stderr.write("Recusado: --host-esperado não confere com o host de DATABASE_URL. Nada foi alterado.\n");
      return 5;
    }
  }
  const conexao = criarConexao(env.DATABASE_URL, { max: 2 });
  try {
    const r = await semearPerfisTeste(conexao.db, env.SEED_SENHA_PERFIS);
    process.stdout.write(
      `Criados: ${r.usuarios} usuários, ${r.investigacoes} investigações, ${r.evidencias} evidências, ${r.publicacoes} publicações, ${r.comentarios} comentários, ${r.curtidas} curtidas.\n`,
    );
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
const executadoDiretamente = process.argv[1]?.replace(/\\/g, "/").endsWith("/cli/seedPerfisTeste.ts");
if (executadoDiretamente) {
  principal(process.argv.slice(2), process.env).then(
    (codigo) => process.exit(codigo),
    () => process.exit(1),
  );
}
