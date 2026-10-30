import { z } from "zod";

// Regras copiadas dos validadores do front e do contrato (docs/API.md, seção 3). O servidor é a fonte
// autoritativa; o front valida só para UX.
export const SENHA_MINIMA = 8;
export const SENHA_MAXIMA = 128;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = z
  .string({ error: "Informe seu e-mail." })
  .trim()
  .toLowerCase()
  .min(1, "Informe seu e-mail.")
  .max(254, "O e-mail pode ter no máximo 254 caracteres.")
  .regex(FORMATO_EMAIL, "Informe um e-mail válido, como nome@exemplo.com.");

const usuario = z
  .string({ error: "Informe um nome de usuário." })
  .trim()
  .toLowerCase()
  .min(1, "Informe um nome de usuário.")
  .regex(/^[a-z0-9_]{3,30}$/, "Use de 3 a 30 caracteres: letras, números e _ (sublinhado).");

// Senha não é aparada nem alterada: espaços fazem parte dela.
const senhaNova = z
  .string({ error: "Informe uma senha." })
  .min(SENHA_MINIMA, `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`)
  .max(SENHA_MAXIMA, `A senha pode ter no máximo ${SENHA_MAXIMA} caracteres.`);

// `nome` é opcional: vazio ou ausente vira o próprio `usuario`.
const nome = z.preprocess(
  (valor) => (typeof valor === "string" && valor.trim() === "" ? undefined : valor),
  z.string().trim().max(60, "O nome pode ter no máximo 60 caracteres.").optional(),
);

export const esquemaCadastro = z.object({ usuario, email, senha: senhaNova, nome }).strict();

// No login a senha não recebe regra de formato (nada a revelar sobre a política); só tamanho para não
// gastar CPU com entradas absurdas.
export const esquemaEntrar = z
  .object({
    email,
    senha: z
      .string({ error: "Informe sua senha." })
      .min(1, "Informe sua senha.")
      .max(SENHA_MAXIMA, "E-mail ou senha incorretos."),
  })
  .strict();

export type EntradaCadastro = z.output<typeof esquemaCadastro>;
export type EntradaEntrar = z.output<typeof esquemaEntrar>;

export interface UsuarioPrivado {
  id: string;
  usuario: string;
  nome: string;
  bio: string;
  avatar: string | null;
  banner: string | null;
  criadoEm: string;
  email: string;
  papel: "membro" | "moderador" | "admin";
}
