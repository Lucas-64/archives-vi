// Cria o primeiro administrador. Uso (veja docs/backend/README.md):
//   npm run admin:criar -- --usuario <nome> --email <e-mail> [--nome <nome>] [--confirmar]
//   npm run admin:criar -- --promover --usuario <nome> [--confirmar]
// A senha NUNCA vai na linha de comando: é lida de um prompt sem eco (terminal) ou de ADMIN_SENHA (sem terminal).
// Usa só DATABASE_URL. Não roda em instalação, build, migração nem rota.
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

import { criarConexao } from "../db/cliente";
import { criarPrimeiroAdmin, ErroBootstrap, type EntradaPrimeiroAdmin } from "../servicos/admin";
import type { ParametrosScrypt } from "../auth/senha";

// Códigos de saída documentados.
export const SAIDA = { ok: 0, erro: 1, entradaInvalida: 2, jaExisteAdmin: 3, conflito: 4, cancelado: 5 } as const;

export interface EntradaSaida {
  temTerminal: boolean;
  escrever: (texto: string) => void;
  escreverErro: (texto: string) => void;
  // Lê uma linha. `semEco` oculta o que é digitado (senha).
  perguntar: (pergunta: string, semEco: boolean) => Promise<string>;
}

export interface AmbienteCli {
  env: Record<string, string | undefined>;
  io: EntradaSaida;
  // Executa a regra de negócio; injetável para testes de orquestração.
  executar?: (url: string, entrada: EntradaPrimeiroAdmin) => Promise<{ usuario: string; id: string; modo: string }>;
  parametrosSenha?: ParametrosScrypt;
}

interface Argumentos {
  usuario?: string;
  email?: string;
  nome?: string;
  promover: boolean;
  confirmar: boolean;
  ajuda: boolean;
}

const AJUDA = `Cria o primeiro administrador do Archives VI.

  npm run admin:criar -- --usuario <nome> --email <e-mail> [--nome <nome>] [--confirmar]
  npm run admin:criar -- --promover --usuario <nome> [--confirmar]

A senha é pedida sem eco no terminal ou lida de ADMIN_SENHA quando não há terminal. Nunca use a linha de comando.
Variável obrigatória: DATABASE_URL. Em NODE_ENV=production, --confirmar é obrigatório.
Saídas: 0 ok; 1 erro inesperado; 2 entrada inválida; 3 já existe administrador (nada foi alterado);
4 conflito (usuário ou e-mail já existe, ou conta a promover não existe); 5 cancelado.
`;

export function lerArgumentos(argv: string[]): Argumentos | { erro: string } {
  const resultado: Argumentos = { promover: false, confirmar: false, ajuda: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const valor = () => {
      const proximo = argv[i + 1];
      if (proximo === undefined || proximo.startsWith("--")) return undefined;
      i += 1;
      return proximo;
    };
    if (arg === "--ajuda" || arg === "-h") resultado.ajuda = true;
    else if (arg === "--promover") resultado.promover = true;
    else if (arg === "--confirmar") resultado.confirmar = true;
    else if (arg === "--usuario" || arg === "--email" || arg === "--nome") {
      const v = valor();
      if (v === undefined) return { erro: `${arg} precisa de um valor.` };
      resultado[arg.slice(2) as "usuario" | "email" | "nome"] = v;
    } else if (arg === "--senha" || arg.startsWith("--senha=")) {
      return { erro: "A senha não pode ser passada na linha de comando. Use o prompt ou ADMIN_SENHA." };
    } else return { erro: `Argumento desconhecido: ${arg.startsWith("--") ? arg : "(valor solto)"}.` };
  }
  return resultado;
}

export async function executarCriarAdmin(argv: string[], ambiente: AmbienteCli): Promise<number> {
  const { io, env } = ambiente;
  const args = lerArgumentos(argv);
  if ("erro" in args) {
    io.escreverErro(`${args.erro}\n`);
    return SAIDA.entradaInvalida;
  }
  if (args.ajuda) {
    io.escrever(AJUDA);
    return SAIDA.ok;
  }

  const url = env.DATABASE_URL;
  if (!url) {
    io.escreverErro("Defina DATABASE_URL.\n");
    return SAIDA.entradaInvalida;
  }
  if (!args.usuario) {
    io.escreverErro("Informe --usuario.\n");
    return SAIDA.entradaInvalida;
  }
  if (!args.promover && !args.email) {
    io.escreverErro("Informe --email (ou use --promover).\n");
    return SAIDA.entradaInvalida;
  }
  if (args.promover && (args.email || args.nome)) {
    io.escreverErro("Com --promover, informe apenas --usuario.\n");
    return SAIDA.entradaInvalida;
  }
  if (env.NODE_ENV === "production" && !args.confirmar) {
    io.escreverErro("Em produção é obrigatório passar --confirmar.\n");
    return SAIDA.cancelado;
  }

  let entrada: EntradaPrimeiroAdmin;
  if (args.promover) {
    // Mudança de privilégio de conta existente: confirmação digitada (terminal) ou --confirmar (sem terminal).
    if (io.temTerminal) {
      const digitado = (await io.perguntar(`Promover "${args.usuario}" a administrador? Isso encerra as sessões dela. Digite o nome de usuário para confirmar: `, false)).trim().toLowerCase();
      if (digitado !== args.usuario.trim().toLowerCase()) {
        io.escreverErro("Confirmação não confere. Nada foi alterado.\n");
        return SAIDA.cancelado;
      }
    } else if (!args.confirmar) {
      io.escreverErro("Sem terminal, a promoção exige --confirmar.\n");
      return SAIDA.cancelado;
    }
    entrada = { modo: "promover", usuario: args.usuario };
  } else {
    let senha: string | undefined;
    if (io.temTerminal) {
      senha = await io.perguntar("Senha do administrador (não aparece na tela): ", true);
      const repetida = await io.perguntar("Repita a senha: ", true);
      if (senha !== repetida) {
        io.escreverErro("As senhas não conferem. Nada foi alterado.\n");
        return SAIDA.entradaInvalida;
      }
    } else {
      senha = env.ADMIN_SENHA;
    }
    if (!senha) {
      io.escreverErro("Informe a senha pelo prompt (terminal) ou por ADMIN_SENHA (sem terminal).\n");
      return SAIDA.entradaInvalida;
    }
    entrada = { modo: "criar", usuario: args.usuario, email: args.email as string, nome: args.nome, senha };
  }

  const executar =
    ambiente.executar ??
    (async (conexaoUrl: string, dados: EntradaPrimeiroAdmin) => {
      const conexao = criarConexao(conexaoUrl, { max: 2 });
      try {
        return await criarPrimeiroAdmin(conexao.db, dados, { parametrosSenha: ambiente.parametrosSenha });
      } finally {
        await conexao.pool.end();
      }
    });

  try {
    const r = await executar(url, entrada);
    io.escrever(r.modo === "promover" ? `Conta "${r.usuario}" promovida a administrador (id ${r.id}). As sessões dela foram encerradas.\n` : `Administrador "${r.usuario}" criado (id ${r.id}).\n`);
    return SAIDA.ok;
  } catch (erro) {
    if (erro instanceof ErroBootstrap) {
      // Mensagens do serviço não contêm senha, hash nem e-mail.
      io.escreverErro(`${erro.message}\n`);
      if (erro.campos) for (const [campo, mensagem] of Object.entries(erro.campos)) io.escreverErro(`  ${campo}: ${mensagem}\n`);
      if (erro.codigo === "ja_existe_admin") return SAIDA.jaExisteAdmin;
      if (erro.codigo === "entrada_invalida") return SAIDA.entradaInvalida;
      return SAIDA.conflito;
    }
    // Erro inesperado: só o nome, nunca a mensagem (pode conter trechos de consulta/parâmetros).
    io.escreverErro(`Falha inesperada (${erro instanceof Error ? erro.name : "erro"}). Nada foi confirmado.\n`);
    return SAIDA.erro;
  }
}

function ioDoProcesso(): EntradaSaida {
  const temTerminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  return {
    temTerminal,
    escrever: (t) => void process.stdout.write(t),
    escreverErro: (t) => void process.stderr.write(t),
    perguntar: (pergunta, semEco) =>
      new Promise((resolve) => {
        // Com `semEco`, a saída do readline vai para um destino mudo: o que é digitado não é ecoado.
        let ecoar = true;
        const saida = new Writable({
          write(chunk, _enc, cb) {
            if (ecoar) process.stdout.write(chunk);
            cb();
          },
        });
        const rl = createInterface({ input: process.stdin, output: saida, terminal: true });
        process.stdout.write(pergunta);
        ecoar = !semEco;
        rl.question("", (resposta) => {
          rl.close();
          if (semEco) process.stdout.write("\n");
          resolve(resposta);
        });
      }),
  };
}

// Só roda como script, nunca ao ser importado pelos testes.
const executadoDiretamente = process.argv[1]?.replace(/\\/g, "/").endsWith("/cli/criarAdmin.ts");
if (executadoDiretamente) {
  executarCriarAdmin(process.argv.slice(2), { env: process.env, io: ioDoProcesso() }).then(
    (codigo) => process.exit(codigo),
    () => process.exit(SAIDA.erro),
  );
}
