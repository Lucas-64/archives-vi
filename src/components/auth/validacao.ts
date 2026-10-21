// Validação básica no navegador, só para feedback imediato. O servidor valida de novo e decide.

export const MINIMO_CARACTERES_SENHA = 8;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function mensagemEmail(valor: string): string | undefined {
  const texto = valor.trim();

  if (!texto) return "Informe seu e-mail.";
  if (!FORMATO_EMAIL.test(texto)) return "Informe um e-mail válido, como nome@exemplo.com.";

  return undefined;
}
