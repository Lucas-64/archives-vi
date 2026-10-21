import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Senhas com scrypt (node:crypto), sem dependência nativa. Parâmetros no padrão recomendado pela OWASP
// (N=2^15, r=8, p=3: cerca de 32 MiB de memória por hash). Para subir o custo no futuro, mude
// PARAMETROS_PADRAO: hashes antigos continuam válidos e `precisaRehash` indica quando regravar.
export interface ParametrosScrypt {
  N: number;
  r: number;
  p: number;
}

export const PARAMETROS_PADRAO: ParametrosScrypt = { N: 2 ** 15, r: 8, p: 3 };
export const TAMANHO_SAL = 16;
export const TAMANHO_HASH = 64;
export const SENHA_MAXIMA = 128;

function derivar(senha: string, sal: Buffer, parametros: ParametrosScrypt, tamanho: number): Promise<Buffer> {
  // maxmem acima do mínimo necessário (128 * N * r) para o scrypt não recusar os parâmetros.
  const opcoes: ScryptOptions = {
    N: parametros.N,
    r: parametros.r,
    p: parametros.p,
    maxmem: 128 * parametros.N * parametros.r * 2 + 1024 * 1024,
  };
  return new Promise((resolver, rejeitar) => {
    scrypt(senha.normalize("NFKC"), sal, tamanho, opcoes, (erro, chave) => (erro ? rejeitar(erro) : resolver(chave)));
  });
}

// Formato: scrypt$N$r$p$sal(base64)$hash(base64). Os parâmetros ficam no próprio hash.
export async function hashSenha(senha: string, parametros: ParametrosScrypt = PARAMETROS_PADRAO): Promise<string> {
  const sal = randomBytes(TAMANHO_SAL);
  const chave = await derivar(senha, sal, parametros, TAMANHO_HASH);
  return ["scrypt", parametros.N, parametros.r, parametros.p, sal.toString("base64"), chave.toString("base64")].join("$");
}

interface HashLido extends ParametrosScrypt {
  sal: Buffer;
  chave: Buffer;
}

function lerHash(hash: string): HashLido | null {
  const partes = hash.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return null;
  const [N, r, p] = partes.slice(1, 4).map(Number);
  if (![N, r, p].every((n) => Number.isInteger(n) && n > 0)) return null;
  const sal = Buffer.from(partes[4], "base64");
  const chave = Buffer.from(partes[5], "base64");
  if (sal.length === 0 || chave.length === 0) return null;
  return { N, r, p, sal, chave };
}

// Compara em tempo constante. Hash ilegível ou senha longa demais: falso, sem exceção.
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  if (senha.length > SENHA_MAXIMA) return false;
  const lido = lerHash(hash);
  if (!lido) return false;
  const calculada = await derivar(senha, lido.sal, lido, lido.chave.length);
  return calculada.length === lido.chave.length && timingSafeEqual(calculada, lido.chave);
}

export function precisaRehash(hash: string, parametros: ParametrosScrypt = PARAMETROS_PADRAO): boolean {
  const lido = lerHash(hash);
  if (!lido) return true;
  return lido.N !== parametros.N || lido.r !== parametros.r || lido.p !== parametros.p || lido.chave.length !== TAMANHO_HASH;
}
