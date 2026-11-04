"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarData } from "../../lib/formatacao";
import { classificacaoDoMisterio, textoInvestigacoesAbertas } from "../../lib/misterio";
import { ImagemCapa } from "../investigacao-classica/ImagemCapa";
import { VideoYoutube } from "../investigacao/VideoYoutube";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { EmptyState } from "../states/EmptyState";
import { ClassificacaoBadge } from "../ui/ClassificacaoBadge";

export interface MisterioPaginaProps {
  slug: string;
  titulo: string;
  descricao: string;
  imagem: string | null;
  classificacao: string;
  video?: { url: string; titulo?: string };
  autor: { nome: string; usuario: string };
  criadoEm: string;
  investigacoesAbertas: number;
}

// Página simples do mistério (ADR-044): para ler ou assistir. Sem evidências, votos nem ferramentas de
// investigação; quem quiser aprofundar abre uma investigação vinculada.
export function MisterioPagina(p: MisterioPaginaProps) {
  return (
    <Pagina>
      <Breadcrumb
        itens={[
          { label: "Início", href: ROUTES.inicio },
          { label: "Mistérios", href: ROUTES.misterios },
          { label: p.titulo },
        ]}
      />
      <Cabecalho>
        <ClassificacaoBadge classificacao={classificacaoDoMisterio(p.classificacao)} size="medium" />
        <Titulo>{p.titulo}</Titulo>
        <Meta>
          Por <Link href={ROUTES.perfil(p.autor.usuario)}>{p.autor.nome}</Link> · {formatarData(p.criadoEm.slice(0, 10))}
        </Meta>
      </Cabecalho>

      <Capa>
        <ImagemCapa src={p.imagem} sizes="(max-width: 1023px) 100vw, 900px" priority />
      </Capa>

      <VideoYoutube url={p.video?.url} titulo={p.video?.titulo} />

      <Texto>{p.descricao}</Texto>

      <Aprofundar aria-labelledby="misterio-investigacoes">
        <h2 id="misterio-investigacoes">Quer ir mais fundo?</h2>
        <p>
          {textoInvestigacoesAbertas(p.investigacoesAbertas)} sobre este mistério.
          {p.investigacoesAbertas > 0 ? (
            <>
              {" "}
              <Link href={`${ROUTES.investigacoes}?misterio=${encodeURIComponent(p.slug)}`}>Ver as investigações</Link>
            </>
          ) : null}
        </p>
        <Botao href={`${ROUTES.criarInvestigacao}?misterio=${encodeURIComponent(p.slug)}`}>
          Abrir investigação sobre este mistério
        </Botao>
      </Aprofundar>

      <section aria-labelledby="misterio-comentarios">
        <Subtitulo id="misterio-comentarios">Comentários</Subtitulo>
        <EmptyState
          titulo="Comentários ainda não disponíveis"
          descricao="Os comentários simples deste mistério chegam em breve. Para discutir a fundo, abra uma investigação."
        />
      </section>
    </Pagina>
  );
}

const Pagina = styled.article`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const Cabecalho = styled.header`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Capa = styled.div`
  position: relative;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Texto = styled.p`
  font-size: 16px;
  line-height: 1.7;
  white-space: pre-line;
  overflow-wrap: anywhere;
`;

const Aprofundar = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border: 1px dashed ${({ theme }) => theme.colors.pink};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  h2 {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 22px;
    text-transform: uppercase;
  }

  p {
    font-size: 15px;
    line-height: 1.5;
  }

  p a {
    color: ${({ theme }) => theme.colors.pink};
    text-decoration: underline;
  }
`;

const Botao = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gradientStart}, ${({ theme }) => theme.colors.gradientEnd});

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;

const Subtitulo = styled.h2`
  margin-bottom: 12px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
`;
