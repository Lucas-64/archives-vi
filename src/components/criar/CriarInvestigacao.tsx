"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { criarInvestigacaoNaApi } from "../../lib/investigacoesApi";
import { useRascunhoAutomatico } from "../../lib/useRascunhoAutomatico";
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
import { FormularioInvestigacao } from "./FormularioInvestigacao";
import { PreviaCard } from "./PreviaCard";
import {
  RASCUNHO_VAZIO,
  montarEntrada,
  validarInvestigacao,
  type ErrosInvestigacao,
  type RascunhoInvestigacao,
} from "./validarInvestigacao";

// Estado da página /criar/investigacao (ADR-044: investigação é o objeto rico; mistério é outro tipo). Cria pela API real (POST /api/v1/investigacoes). O sucesso só existe
// depois de o servidor confirmar (201 com o slug); então a pessoa é levada à investigação criada.
// Exige sessão (a API também exige). Limites e permissões são decididos pelo servidor.
export function CriarInvestigacao({ misterio = null }: { misterio?: { slug: string; titulo: string } | null }) {
  const router = useRouter();
  const { estado, usuario } = useSessao();
  const [rascunho, setRascunho] = useState<RascunhoInvestigacao>(RASCUNHO_VAZIO);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<ErrosInvestigacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const errosLocais = validarInvestigacao(rascunho);

  // Rascunho automático (só neste navegador, por usuário). Apagado ao publicar.
  const chaveRascunho = estado === "autenticado" && usuario ? `rascunho:investigacao:${usuario.usuario}` : null;
  const autosave = useRascunhoAutomatico<RascunhoInvestigacao>(
    chaveRascunho,
    rascunho,
    RASCUNHO_VAZIO,
    setRascunho,
    (r) => JSON.stringify(r) === JSON.stringify(RASCUNHO_VAZIO),
  );

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
    const resultado = await criarInvestigacaoNaApi({ ...montarEntrada(rascunho), ...(misterio ? { misterio: misterio.slug } : {}) });

    if (resultado.ok) {
      autosave.limpar();
      // Mantém o estado "enviando" até a navegação, para não permitir um segundo envio.
      router.push(ROUTES.investigacao(resultado.slug));
      return;
    }
    setEnviando(false);
    setErrosServidor(resultado.campos);
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para abrir a investigação." : (resultado.erroGeral ?? null));
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
              { label: "Investigações", href: ROUTES.investigacoes },
              { label: "Abrir investigação" },
            ]}
          />
          <PageHeader
            titulo="Abrir investigação"
            descricao="Abra uma investigação com sua hipótese, argumentos e fontes, na mesma ordem em que a página será lida. As evidências são enviadas depois, na página da investigação."
          />
          {misterio ? (
            <Vinculo>
              Esta investigação ficará vinculada ao mistério <Link href={ROUTES.misterio(misterio.slug)}>{misterio.titulo}</Link>.
            </Vinculo>
          ) : null}
          <AnchorNav rotulo="Etapas para abrir a investigação" itens={ETAPAS} />
          <PageBody>
            {estado === "carregando" ? <Skeleton height="520px" radius="lg" /> : null}
            {estado === "erro" ? (
              <EmptyState titulo="Não foi possível verificar sua sessão" descricao="Recarregue a página para tentar de novo." />
            ) : null}
            {estado === "visitante" ? (
              <EmptyState
                titulo="Entre para abrir uma investigação"
                descricao="Abrir uma investigação exige uma conta. Entre ou crie a sua para participar."
                acao={<Link href={ROUTES.entrar}>Entrar</Link>}
              />
            ) : null}
            {estado === "autenticado" && autosave.restaurado ? (
              <AvisoRascunho role="status">
                Rascunho restaurado neste navegador.{" "}
                <button type="button" onClick={autosave.descartar}>
                  Descartar rascunho
                </button>
              </AvisoRascunho>
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
      sidebar={
        <>
          <PreviaCard
            titulo={rascunho.titulo.trim() || "Título da investigação"}
            descricao={rascunho.descricao.trim() || "A descrição aparece aqui enquanto você escreve."}
            imagem={rascunho.imagemUrl}
            selo={
              <Badge size="small" variant={estadoInicial.variant} uppercase>
                {estadoInicial.rotulo}
              </Badge>
            }
            meta={[ROTULO_CATEGORIA[rascunho.categoria] ?? "Categoria não escolhida", rascunho.localizacao.trim() || "Sem local"]}
          />
          <SidebarBox titulo="Estado da investigação">
            <Nota>Toda investigação nova começa em andamento. {estadoInicial.descricao}</Nota>
          </SidebarBox>
        </>
      }
    />
  );
}

// Mesmas seções (e ids) do formulário. Segue a ordem da página da investigação.
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

const Vinculo = styled.p`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.pink};
  font-size: 14px;

  a {
    color: ${({ theme }) => theme.colors.pink};
    text-decoration: underline;
  }
`;

const AvisoRascunho = styled.p`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  button {
    color: ${({ theme }) => theme.colors.pink};
    text-decoration: underline;
    font: inherit;
    cursor: pointer;
  }
`;
