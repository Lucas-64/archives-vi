"use client";

import { useState, type FormEvent } from "react";

import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { AuthBotao, AuthForm } from "./AuthCard";
import { AvisoDemonstracao } from "./AvisoDemonstracao";
import { mensagemEmail } from "./validacao";

interface ErrosEntrar {
  email?: string;
  senha?: string;
}

// Demonstrative sign-in form. It validates in the browser and never authenticates anyone.
// Values are read from FormData on submit and are not kept in state or storage.
export function FormularioEntrar() {
  const [erros, setErros] = useState<ErrosEntrar>({});
  const [enviado, setEnviado] = useState(false);

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);

    const proximosErros: ErrosEntrar = {
      email: mensagemEmail(String(dados.get("email") ?? "")),
      senha: String(dados.get("senha") ?? "") ? undefined : "Informe sua senha.",
    };
    const primeiroComErro = (Object.keys(proximosErros) as (keyof ErrosEntrar)[]).find(
      (campo) => proximosErros[campo],
    );

    setErros(proximosErros);
    setEnviado(!primeiroComErro);

    if (primeiroComErro) {
      (formulario.elements.namedItem(primeiroComErro) as HTMLInputElement | null)?.focus();
    }
  }

  return (
    <AuthForm noValidate onSubmit={aoEnviar}>
      <FormField label="E-mail" required error={erros.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
        />
      </FormField>

      <FormField label="Senha" required error={erros.senha}>
        <Input
          name="senha"
          type="password"
          autoComplete="current-password"
        />
      </FormField>

      <AuthBotao>
        <Button type="submit" variant="primary" size="large">
          Entrar
        </Button>
      </AuthBotao>

      {enviado ? (
        <AvisoDemonstracao
          anuncio
          mensagem="Nenhuma sessão foi criada. A autenticação ainda não existe nesta versão."
        />
      ) : null}

      <AvisoDemonstracao mensagem="Não há autenticação real nesta versão. Ao enviar, nenhuma sessão é criada e nada é salvo." />
    </AuthForm>
  );
}
