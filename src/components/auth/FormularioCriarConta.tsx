"use client";

import { useState, type FormEvent } from "react";

import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { AuthBotao, AuthForm } from "./AuthCard";
import { AvisoDemonstracao } from "./AvisoDemonstracao";
import { MINIMO_CARACTERES_SENHA, mensagemEmail } from "./validacao";

type CampoCadastro = "usuario" | "email" | "senha" | "confirmacao";

type ErrosCriarConta = Partial<Record<CampoCadastro, string>>;

const DICA_SENHA = `Use no mínimo ${MINIMO_CARACTERES_SENHA} caracteres.`;
const MENSAGEM_SENHA_CURTA = `A senha deve ter no mínimo ${MINIMO_CARACTERES_SENHA} caracteres.`;

// Demonstrative sign-up form. It validates in the browser and never creates an account.
// Values are read from FormData on submit and are not kept in state or storage.
// Username uniqueness is not checked: there is no backend to check it against.
export function FormularioCriarConta() {
  const [erros, setErros] = useState<ErrosCriarConta>({});
  const [enviado, setEnviado] = useState(false);

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const usuario = String(dados.get("usuario") ?? "");
    const senha = String(dados.get("senha") ?? "");
    const confirmacao = String(dados.get("confirmacao") ?? "");

    const proximosErros: ErrosCriarConta = {
      usuario: usuario.trim() ? undefined : "Informe um nome de usuário.",
      email: mensagemEmail(String(dados.get("email") ?? "")),
      senha: validarSenha(senha),
      confirmacao: validarConfirmacao(senha, confirmacao),
    };
    const ordem: CampoCadastro[] = ["usuario", "email", "senha", "confirmacao"];
    const primeiroComErro = ordem.find((campo) => proximosErros[campo]);

    setErros(proximosErros);
    setEnviado(!primeiroComErro);

    if (primeiroComErro) {
      (formulario.elements.namedItem(primeiroComErro) as HTMLInputElement | null)?.focus();
    }
  }

  return (
    <AuthForm noValidate onSubmit={aoEnviar}>
      <FormField label="Nome de usuário" required error={erros.usuario}>
        <Input
          name="usuario"
          type="text"
          autoComplete="username"
        />
      </FormField>

      <FormField label="E-mail" required error={erros.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
        />
      </FormField>

      {/* The hint is hidden only while the error repeats the same minimum-length rule. */}
      <FormField
        label="Senha"
        required
        hint={erros.senha === MENSAGEM_SENHA_CURTA ? undefined : DICA_SENHA}
        error={erros.senha}
      >
        <Input
          name="senha"
          type="password"
          autoComplete="new-password"
        />
      </FormField>

      <FormField label="Confirmar senha" required error={erros.confirmacao}>
        <Input
          name="confirmacao"
          type="password"
          autoComplete="new-password"
        />
      </FormField>

      <AuthBotao>
        <Button type="submit" variant="primary" size="large">
          Criar conta
        </Button>
      </AuthBotao>

      {enviado ? (
        <AvisoDemonstracao
          anuncio
          mensagem="Nenhuma conta foi criada. O cadastro ainda não existe nesta versão."
        />
      ) : null}

      <AvisoDemonstracao mensagem="Não há cadastro real nesta versão. Ao enviar, nenhuma conta é criada e nada é salvo." />
    </AuthForm>
  );
}

function validarSenha(senha: string): string | undefined {
  if (!senha) return "Informe uma senha.";
  if (senha.length < MINIMO_CARACTERES_SENHA) {
    return MENSAGEM_SENHA_CURTA;
  }

  return undefined;
}

function validarConfirmacao(senha: string, confirmacao: string): string | undefined {
  if (!confirmacao) return "Confirme a senha.";
  if (confirmacao !== senha) return "As senhas não coincidem.";

  return undefined;
}
