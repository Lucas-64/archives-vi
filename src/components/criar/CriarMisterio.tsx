"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ROUTES } from "../../constants/routes";
import { classificacaoDoMisterio } from "../../lib/misterio";
import { criarMisterioNaApi } from "../../lib/misteriosApi";
import { useSessao } from "../auth/SessaoProvider";
import { ContentGrid } from "../layout/ContentGrid";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { PageBody } from "../page/PageBody";
import { PageHeader } from "../page/PageHeader";
import { EmptyState } from "../states/EmptyState";
import { Skeleton } from "../states/Skeleton";
import { ClassificacaoBadge } from "../ui/ClassificacaoBadge";
import { FormularioMisterio } from "./FormularioMisterio";
import { PreviaCard } from "./PreviaCard";
import { MISTERIO_VAZIO, montarEntradaMisterio, validarMisterio, type ErrosMisterio, type RascunhoMisterio } from "./validarMisterio";

// Página /criar/misterio (ADR-044): postagem simples, publicada por POST /api/v1/misterios. O sucesso só existe
// depois de o servidor confirmar; então a pessoa é levada ao mistério criado. Exige sessão.
export function CriarMisterio() {
  const router = useRouter();
  const { estado } = useSessao();
  const [rascunho, setRascunho] = useState<RascunhoMisterio>(MISTERIO_VAZIO);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<ErrosMisterio>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const errosLocais = validarMisterio(rascunho);

  function alterar(proximo: RascunhoMisterio, chaves: string[]) {
    setRascunho(proximo);
    setErrosServidor((atuais) => {
      const restantes = { ...atuais };
      for (const chave of chaves) delete restantes[chave];
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
    const resultado = await criarMisterioNaApi(montarEntradaMisterio(rascunho));
    if (resultado.ok) {
      router.push(ROUTES.misterio(resultado.slug));
      return;
    }
    setEnviando(false);
    setErrosServidor(resultado.campos);
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para publicar o mistério." : (resultado.erroGeral ?? null));
  }

  const erros: ErrosMisterio = { ...(tentouEnviar ? errosLocais : {}), ...errosServidor };

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
            descricao="Compartilhe algo curioso com uma imagem ou um vídeo. Quem quiser aprofundar abre uma investigação a partir dele."
          />
          <PageBody>
            {estado === "carregando" ? <Skeleton height="420px" radius="lg" /> : null}
            {estado === "erro" ? (
              <EmptyState titulo="Não foi possível verificar sua sessão" descricao="Recarregue a página para tentar de novo." />
            ) : null}
            {estado === "visitante" ? (
              <EmptyState
                titulo="Entre para criar um mistério"
                descricao="Criar um mistério exige uma conta. Entre ou crie a sua."
                acao={<Link href={ROUTES.entrar}>Entrar</Link>}
              />
            ) : null}
            {estado === "autenticado" ? (
              <FormularioMisterio rascunho={rascunho} erros={erros} erroGeral={erroGeral} enviando={enviando} onAlterar={alterar} onEnviar={enviar} />
            ) : null}
          </PageBody>
        </>
      }
      sidebar={
        estado === "autenticado" ? (
          <PreviaCard
            titulo={rascunho.titulo.trim() || "Título do mistério"}
            descricao={rascunho.descricao.trim() || "A descrição aparece aqui enquanto você escreve."}
            imagem={rascunho.imagemUrl}
            selo={rascunho.classificacao ? <ClassificacaoBadge classificacao={classificacaoDoMisterio(rascunho.classificacao)} /> : undefined}
            meta={["Nenhuma investigação aberta"]}
          />
        ) : undefined
      }
    />
  );
}
