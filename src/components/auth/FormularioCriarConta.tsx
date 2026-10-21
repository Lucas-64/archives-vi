"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ROUTES } from "../../constants/routes";
import { cadastrarNaApi } from "../../lib/autenticacaoApi";
import { useSessao } from "./SessaoProvider";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { AuthBotao, AuthErro, AuthForm } from "./AuthCard";
import { MINIMO_CARACTERES_SENHA, mensagemEmail } from "./validacao";

const DICA_USUARIO = "De 3 a 30 caracteres: letras minúsculas, números e sublinhado.";

type CampoCadastro = "usuario" | "email" | "senha" | "confirmacao";

type ErrosCriarConta = Partial<Record<CampoCadastro, string>>;

const DICA_SENHA = `Use no mínimo ${MINIMO_CARACTERES_SENHA} caracteres.`;
const MENSAGEM_SENHA_CURTA = `A senha deve ter no mínimo ${MINIMO_CARACTERES_SENHA} caracteres.`;
const ORDEM: CampoCadastro[] = ["usuario", "email", "senha", "confirmacao"];

// Formulário de cadastro. Valida o básico no navegador (a confirmação de senha só existe aqui) e cria a conta
// pela API; unicidade e demais regras são do servidor. Os valores são lidos do FormData no envio.
export function FormularioCriarConta() {
  const router = useRouter();
  const { atualizar } = useSessao();
  const [erros, setErros] = useState<ErrosCriarConta>({});
  const [erroGeral, setErroGeral] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const usuario = String(dados.get("usuario") ?? "");
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");
    const confirmacao = String(dados.get("confirmacao") ?? "");

    const proximosErros: ErrosCriarConta = {
      usuario: usuario.trim() ? undefined : "Informe um nome de usuário.",
      email: mensagemEmail(email),
      senha: validarSenha(senha),
      confirmacao: validarConfirmacao(senha, confirmacao),
    };
    const primeiroComErro = ORDEM.find((campo) => proximosErros[campo]);

    setErros(proximosErros);
    setErroGeral(undefined);
    if (primeiroComErro) {
      (formulario.elements.namedItem(primeiroComErro) as HTMLInputElement | null)?.focus();
      return;
    }

    setEnviando(true);
    const resultado = await cadastrarNaApi({ usuario: usuario.trim(), email: email.trim(), senha });
    if (resultado.ok) {
      // A API já abre a sessão no cadastro: relê a sessão (o cabeçalho muda) e segue para o início.
      await atualizar();
      router.replace(ROUTES.inicio);
      return;
    }
    setEnviando(false);
    const doServidor: ErrosCriarConta = { usuario: resultado.campos.usuario, email: resultado.campos.email, senha: resultado.campos.senha };
    setErros(doServidor);
    setErroGeral(resultado.erroGeral);
    const comErro = ORDEM.find((campo) => doServidor[campo]);
    if (comErro) (formulario.elements.namedItem(comErro) as HTMLInputElement | null)?.focus();
  }

  return (
    <AuthForm noValidate onSubmit={aoEnviar}>
      <FormField label="Nome de usuário" required hint={DICA_USUARIO} error={erros.usuario}>
        <Input name="usuario" type="text" autoComplete="username" />
      </FormField>

      <FormField label="E-mail" required error={erros.email}>
        <Input name="email" type="email" autoComplete="email" placeholder="nome@exemplo.com" />
      </FormField>

      {/* The hint is hidden only while the error repeats the same minimum-length rule. */}
      <FormField
        label="Senha"
        required
        hint={erros.senha === MENSAGEM_SENHA_CURTA ? undefined : DICA_SENHA}
        error={erros.senha}
      >
        <Input name="senha" type="password" autoComplete="new-password" />
      </FormField>

      <FormField label="Confirmar senha" required error={erros.confirmacao}>
        <Input name="confirmacao" type="password" autoComplete="new-password" />
      </FormField>

      {erroGeral ? <AuthErro role="alert">{erroGeral}</AuthErro> : null}

      <AuthBotao>
        <Button type="submit" variant="primary" size="large" loading={enviando} loadingLabel="Criando conta">
          Criar conta
        </Button>
      </AuthBotao>
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
