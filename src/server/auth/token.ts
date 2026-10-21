import { createHash, randomBytes } from "node:crypto";

// Token de sessão: 32 bytes aleatórios do gerador criptográfico do sistema, em base64url (43 caracteres).
// Só o SHA-256 vai ao banco; o token em si existe apenas no cookie do navegador.
export const BYTES_TOKEN = 32;

export function gerarToken(): string {
  return randomBytes(BYTES_TOKEN).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenComFormatoValido(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
