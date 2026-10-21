import { z } from "zod";

// Variáveis de ambiente do servidor, validadas em um único lugar. A leitura é sob demanda
// (obterEnv), para que `next build` e as páginas do front não dependam de banco configurado.
const urlPostgres = z
  .string({ error: "Defina a variável." })
  .min(1, "Defina a variável.")
  .refine((valor) => /^postgres(ql)?:\/\//.test(valor), "Use uma URL que comece com postgres:// ou postgresql://.");

const esquemaEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: urlPostgres,
});

export type EnvServidor = z.infer<typeof esquemaEnv>;

export class ErroConfiguracao extends Error {
  constructor(public readonly problemas: Record<string, string>) {
    super(
      "Configuração de ambiente inválida:\n" +
        Object.entries(problemas)
          .map(([variavel, mensagem]) => `- ${variavel}: ${mensagem}`)
          .join("\n") +
        "\nVeja .env.example e docs/backend/README.md.",
    );
    this.name = "ErroConfiguracao";
  }
}

// Valida uma fonte de variáveis (process.env por padrão). Nunca inclui valores na mensagem de erro,
// porque a URL do banco pode conter senha.
export function lerEnv(fonte: Record<string, string | undefined> = process.env): EnvServidor {
  const resultado = esquemaEnv.safeParse(fonte);
  if (resultado.success) return resultado.data;

  const problemas: Record<string, string> = {};
  for (const problema of resultado.error.issues) {
    const variavel = String(problema.path[0] ?? "ambiente");
    problemas[variavel] ??= problema.message;
  }
  throw new ErroConfiguracao(problemas);
}

let cache: EnvServidor | undefined;

export function obterEnv(): EnvServidor {
  cache ??= lerEnv();
  return cache;
}
