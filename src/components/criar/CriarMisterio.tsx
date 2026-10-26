"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { criarInvestigacaoNaApi } from "../../lib/investigacoesApi";
import { useSessao } from "../auth/SessaoProvider";
import { ROTULO_CATEGORIA, ESTADO_INVESTIGACAO } from "../../lib/investigacaoEstado";
import { AnchorNav } from "../investigacao/AnchorNav";
import { ContentGrid } from "../layout/ContentGrid";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { SidebarBox } from "../sidebar/SidebarBox";
import { Badge } from "../ui/Badge";
import { PageBody } from "../page/PageBody";
import { PageHeader } from "../page/PageHeader";
import { EmptyState } from "../states/EmptyState";
import { Skeleton } from "../states/Skeleton";
import { FormularioMisterio } from "./FormularioMisterio";
import {
  RASCUNHO_VAZIO,
  montarEntrada,
  validarInvestigacao,
  type ErrosInvestigacao,
  type RascunhoInvestigacao,
} from "./validarInvestigacao";

// Estado da página /criar/misterio (a interface chama de "mistério" o que a API chama de investigação). Cria pela API real (POST /api/v1/investigacoes). O sucesso só existe
// depois de o servidor confirmar (201 com o slug); então a pessoa é levada à investigação criada.
// Exige sessão (a API também exige). Limites e permissões são decididos pelo servidor.
export function CriarMisterio() {
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
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para criar o mistério." : (resultado.erroGeral ?? null));
  }

  const erros: ErrosInvestigacao = { ...(tentouEnviar ? errosLocais : {}), ...errosServidor };

  const estadoInicial = ESTADO_INVESTIGACAO.em_andamento;

  return (
    <ContentGrid
      main={
        <>
          <Breadcrumb
            itens={[
              { label: "Início", href: ROUTES.inicio },
              { label: "Mistérios", href: ROUTES.misterios },
              { label: "Criar mistério" },
            ]}
          />
          <PageHeader
            titulo="Criar mistério"
            descricao="Abra um mistério com sua hipótese, argumentos e fontes, nas mesmas seções da página do mistério. As evidências são enviadas depois, na página dele."
          />
          <AnchorNav rotulo="Etapas para criar o mistério" itens={ETAPAS} />
          <PageBody>
            {estado === "carregando" ? <Skeleton height="520px" radius="lg" /> : null}
            {estado === "erro" ? (
              <EmptyState titulo="Não foi possível verificar sua sessão" descricao="Recarregue a página para tentar de novo." />
            ) : null}
            {estado === "visitante" ? (
              <EmptyState
                titulo="Entre para criar um mistério"
                descricao="Criar um mistério exige uma conta. Entre ou crie a sua para abrir mistérios."
                acao={<Link href={ROUTES.entrar}>Entrar</Link>}
              />
            ) : null}
            {estado === "autenticado" ? (
              <FormularioMisterio
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
      sidebar={
        <>
          <SidebarBox titulo="Estado da investigação">
            <Badge size="small" variant={estadoInicial.variant} uppercase>
              {estadoInicial.rotulo}
            </Badge>
            <Nota>Todo mistério novo começa assim. {estadoInicial.descricao}</Nota>
          </SidebarBox>

          <SidebarBox titulo="Resumo">
            <Texto>{rascunho.descricao.trim() || "A descrição aparece aqui enquanto você escreve."}</Texto>
            <Nota>Título: {rascunho.titulo.trim() || "ainda não informado"}</Nota>
            <Nota>Categoria: {ROTULO_CATEGORIA[rascunho.categoria] ?? "ainda não escolhida"}</Nota>
            <Nota>Local: {rascunho.localizacao.trim() || "não informado"}</Nota>
          </SidebarBox>
        </>
      }
    />
  );
}

// Mesmas seções (e ids) do formulário. Segue a ordem da página do mistério.
const ETAPAS = [
  { id: "passo-identificacao", rotulo: "1. Identificação" },
  { id: "passo-video", rotulo: "2. Vídeo" },
  { id: "passo-teoria", rotulo: "3. Teoria" },
  { id: "passo-evidencias", rotulo: "4. Evidências" },
] as const;

const Nota = styled.p`
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Texto = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
`;
