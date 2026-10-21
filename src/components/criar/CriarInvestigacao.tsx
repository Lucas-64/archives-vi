"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ROUTES } from "../../constants/routes";
import { criarInvestigacaoNaApi } from "../../lib/investigacoesApi";
import { useSessao } from "../auth/SessaoProvider";
import { ContentGrid } from "../layout/ContentGrid";
import { PageBody } from "../page/PageBody";
import { PageHeader } from "../page/PageHeader";
import { EmptyState } from "../states/EmptyState";
import { Skeleton } from "../states/Skeleton";
import { FormularioInvestigacao } from "./FormularioInvestigacao";
import {
  RASCUNHO_VAZIO,
  montarEntrada,
  validarInvestigacao,
  type ErrosInvestigacao,
  type RascunhoInvestigacao,
} from "./validarInvestigacao";

// Estado da página /criar/investigacao. Cria pela API real (POST /api/v1/investigacoes). O sucesso só existe
// depois de o servidor confirmar (201 com o slug); então a pessoa é levada à investigação criada.
// Exige sessão (a API também exige). Limites e permissões são decididos pelo servidor.
export function CriarInvestigacao() {
  const router = useRouter();
  const { estado } = useSessao();
  const [rascunho, setRascunho] = useState<RascunhoInvestigacao>(RASCUNHO_VAZIO);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<ErrosInvestigacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const errosLocais = validarInvestigacao(rascunho);

  // Alterar um campo limpa o que o servidor recusou nele (o erro de uma lista some ao editar qualquer item).
  function alterar(proximo: RascunhoInvestigacao, chaves: string[]) {
    setRascunho(proximo);
    setErrosServidor((atuais) => {
      const restantes = { ...atuais };
      for (const chave of Object.keys(restantes)) {
        if (chaves.some((c) => chave === c || chave.startsWith(`${c}.`))) delete restantes[chave];
      }
      return restantes;
    });
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    setTentouEnviar(true);
    setErroGeral(null);
    if (Object.keys(errosLocais).length > 0) return;

    setEnviando(true);
    const resultado = await criarInvestigacaoNaApi(montarEntrada(rascunho));

    if (resultado.ok) {
      // Mantém o estado "enviando" até a navegação, para não permitir um segundo envio.
      router.push(ROUTES.investigacao(resultado.slug));
      return;
    }
    setEnviando(false);
    setErrosServidor(resultado.campos);
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para criar a investigação." : (resultado.erroGeral ?? null));
  }

  const erros: ErrosInvestigacao = { ...(tentouEnviar ? errosLocais : {}), ...errosServidor };

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Criar investigação"
            descricao="Abra uma investigação com sua hipótese, argumentos e fontes. Evidências são enviadas depois, na página dela."
          />
          <PageBody>
            {estado === "carregando" ? <Skeleton height="520px" radius="lg" /> : null}
            {estado === "erro" ? (
              <EmptyState titulo="Não foi possível verificar sua sessão" descricao="Recarregue a página para tentar de novo." />
            ) : null}
            {estado === "visitante" ? (
              <EmptyState
                titulo="Entre para criar uma investigação"
                descricao="Criar uma investigação exige uma conta. Entre ou crie a sua para abrir investigações."
                acao={<Link href={ROUTES.entrar}>Entrar</Link>}
              />
            ) : null}
            {estado === "autenticado" ? (
              <FormularioInvestigacao
                rascunho={rascunho}
                erros={erros}
                mostrarResumoErro={Object.keys(erros).length > 0}
                erroGeral={erroGeral}
                enviando={enviando}
                onAlterar={alterar}
                onEnviar={enviar}
              />
            ) : null}
          </PageBody>
        </>
      }
    />
  );
}
