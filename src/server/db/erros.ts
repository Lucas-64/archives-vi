// SQLSTATE e nome da restrição de um erro do driver, mesmo embrulhado pelo Drizzle (campo `cause`).
function procurar(erro: unknown, campo: "code" | "constraint"): string | undefined {
  let atual: unknown = erro;
  while (atual && typeof atual === "object") {
    const valor = (atual as Record<string, unknown>)[campo];
    if (typeof valor === "string" && (campo === "constraint" || /^[0-9A-Z]{5}$/.test(valor))) return valor;
    atual = (atual as { cause?: unknown }).cause;
  }
  return undefined;
}

export const codigoPg = (erro: unknown) => procurar(erro, "code");
export const restricaoPg = (erro: unknown) => procurar(erro, "constraint");
