"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ROUTES } from "../../constants/routes";
import { criarPublicacaoNaApi } from "../../lib/publicacoesApi";
import { useSessao } from "../auth/SessaoProvider";
import { ContentGrid } from "../layout/ContentGrid";
import { LinkDeAcao } from "../page/LinkDeAcao";
import { PageBody } from "../page/PageBody";
import { PageHeader } from "../page/PageHeader";
import { EmptyState } from "../states/EmptyState";
import { Skeleton } from "../states/Skeleton";
import { FormularioTeoria } from "./FormularioTeoria";
import { PreviaTeoria } from "./PreviaTeoria";
import { temErros, validarTeoria, type ErrosTeoria, type RascunhoTeoria } from "./validarTeoria";

// Estado da página /criar. Publica pela API real (POST /api/v1/publicacoes). O sucesso só existe depois de o
// servidor confirmar; então a pessoa é levada à publicação criada. Exige sessão (a API também exige).
export function CriarTeoria() {
  const router = useRouter();
  const { estado } = useSessao();
  const [rascunho, setRascunho] = useState<RascunhoTeoria>({ titulo: "", texto: "" });
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<ErrosTeoria>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const erros = validarTeoria(rascunho);
  const existeErro = temErros(erros);

  function alterar(campo: keyof RascunhoTeoria, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setErrosServidor((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    setTentouEnviar(true);
    setErroGeral(null);
    if (existeErro) return;

    setEnviando(true);
    const resultado = await criarPublicacaoNaApi({ titulo: rascunho.titulo.trim(), corpo: rascunho.texto.trim() });

    if (resultado.ok) {
      // Mantém o estado "enviando" até a navegação, para não permitir um segundo envio.
      router.push(ROUTES.publicacao(resultado.slug));
      return;
    }
    setEnviando(false);
    setErrosServidor({ titulo: resultado.campos.titulo, texto: resultado.campos.corpo });
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para publicar." : (resultado.erroGeral ?? null));
  }

  // Os erros só aparecem depois da primeira tentativa de envio; depois, acompanham a digitação.
  // O que o servidor recusou aparece no campo até a pessoa editá-lo.
  const errosVisiveis: ErrosTeoria = {
    titulo: errosServidor.titulo ?? (tentouEnviar ? erros.titulo : undefined),
    texto: errosServidor.texto ?? (tentouEnviar ? erros.texto : undefined),
  };

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Criar teoria"
            descricao="Escreva uma teoria e acompanhe a prévia enquanto digita."
            acao={<LinkDeAcao href={ROUTES.criarMisterio}>Criar mistério</LinkDeAcao>}
          />
          <PageBody>
            {estado === "carregando" ? <Skeleton height="320px" radius="lg" /> : null}
            {estado === "erro" ? (
              <EmptyState titulo="Não foi possível verificar sua sessão" descricao="Recarregue a página para tentar de novo." />
            ) : null}
            {estado === "visitante" ? (
              <EmptyState
                titulo="Entre para criar uma teoria"
                descricao="Publicar exige uma conta. Entre ou crie a sua para escrever e publicar teorias."
                acao={<Link href={ROUTES.entrar}>Entrar</Link>}
              />
            ) : null}
            {estado === "autenticado" ? (
              <FormularioTeoria
                rascunho={rascunho}
                erros={errosVisiveis}
                erroGeral={erroGeral}
                mostrarResumoErro={(tentouEnviar && existeErro) || Object.values(errosServidor).some(Boolean)}
                enviando={enviando}
                onAlterar={alterar}
                onEnviar={enviar}
              />
            ) : null}
          </PageBody>
        </>
      }
      sidebar={estado === "autenticado" ? <PreviaTeoria titulo={rascunho.titulo.trim()} texto={rascunho.texto.trim()} /> : undefined}
    />
  );
}
