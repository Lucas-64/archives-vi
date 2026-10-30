"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ROUTES } from "../../constants/routes";
import { entrarNaApi } from "../../lib/autenticacaoApi";
import { useSessao } from "./SessaoProvider";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { AuthBotao, AuthErro, AuthForm } from "./AuthCard";
import { mensagemEmail } from "./validacao";

interface ErrosEntrar {
  email?: string;
  senha?: string;
}

// Formulário de entrada. Valida o básico no navegador e autentica pela API; quem decide é o servidor.
// Os valores são lidos do FormData no envio e não ficam em estado nem em armazenamento.
export function FormularioEntrar({ destino = ROUTES.inicio }: { destino?: string }) {
  const router = useRouter();
  const { atualizar } = useSessao();
  const [erros, setErros] = useState<ErrosEntrar>({});
  const [erroGeral, setErroGeral] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");

    const proximosErros: ErrosEntrar = {
      email: mensagemEmail(email),
      senha: senha ? undefined : "Informe sua senha.",
    };
    const primeiroComErro = (Object.keys(proximosErros) as (keyof ErrosEntrar)[]).find((campo) => proximosErros[campo]);

    setErros(proximosErros);
    setErroGeral(undefined);
    if (primeiroComErro) {
      (formulario.elements.namedItem(primeiroComErro) as HTMLInputElement | null)?.focus();
      return;
    }

    setEnviando(true);
    const resultado = await entrarNaApi({ email: email.trim(), senha });
    if (resultado.ok) {
      // Relê a sessão (o cabeçalho muda) e mantém o botão desabilitado até a navegação terminar.
      await atualizar();
      router.replace(destino);
      return;
    }
    setEnviando(false);
    setErros({ email: resultado.campos.email, senha: resultado.campos.senha });
    setErroGeral(resultado.erroGeral);
  }

  return (
    <AuthForm noValidate onSubmit={aoEnviar}>
      <FormField label="E-mail" required error={erros.email}>
        <Input name="email" type="email" autoComplete="email" placeholder="nome@exemplo.com" />
      </FormField>

      <FormField label="Senha" required error={erros.senha}>
        <Input name="senha" type="password" autoComplete="current-password" />
      </FormField>

      {erroGeral ? <AuthErro role="alert">{erroGeral}</AuthErro> : null}

      <AuthBotao>
        <Button type="submit" variant="primary" size="large" loading={enviando} loadingLabel="Entrando">
          Entrar
        </Button>
      </AuthBotao>
    </AuthForm>
  );
}
