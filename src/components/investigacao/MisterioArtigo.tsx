"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Evidencia, InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";

// Corpo editorial do mistério. Usa só o que já está no registro: hipótese, argumentos, pergunta
// central e fontes da teoria. Nenhum texto novo é escrito aqui.
export function MisterioCorpo({ teoria }: { teoria: InvestigacaoDetalhe["teoria"] }) {
  return (
    <Artigo>
      <Destaque>
        <RotuloDestaque>Hipótese principal · não confirmada</RotuloDestaque>
        <Lead>{teoria.hipotese}</Lead>
      </Destaque>

      <Subtitulo>Argumentos favoráveis</Subtitulo>
      <Lista>
        {teoria.argumentosFavoraveis.map((argumento) => (
          <li key={argumento}>{argumento}</li>
        ))}
      </Lista>

      <Pergunta>
        <RotuloDestaque>Pergunta central</RotuloDestaque>
        <p>{teoria.perguntaCentral}</p>
      </Pergunta>

      <Subtitulo>Fontes</Subtitulo>
      <Lista>
        {teoria.fontes.map((fonte) => (
          <li key={fonte}>{fonte}</li>
        ))}
      </Lista>
    </Artigo>
  );
}

// Seção exclusiva de fotografias, no meio do artigo. Usa as imagens das evidências públicas.
// Sem imagens, a seção não aparece. Sugestões da comunidade não entram aqui.
export function FotografiasMisterio({ evidencias }: { evidencias: Evidencia[] }) {
  const fotos = evidencias
    .flatMap((evidencia) =>
      (evidencia.imagens ?? []).slice(0, 1).map((imagem) => ({
        chave: `${evidencia.id}-${imagem.alt}`,
        imagem,
        legenda: evidencia.titulo,
      })),
    )
    .slice(0, 4);

  if (fotos.length === 0) return null;

  return (
    <Fotos aria-labelledby="misterio-fotografias">
      <Subtitulo id="misterio-fotografias">Fotografias</Subtitulo>
      <Grade $quantidade={fotos.length}>
        {fotos.map((foto) => (
          <figure key={foto.chave}>
            <Quadro>
              <Image
                src={foto.imagem.image}
                alt={foto.imagem.alt}
                fill
                sizes="(max-width: 767px) 100vw, 440px"
                style={{ objectFit: "cover" }}
              />
            </Quadro>
            <Legenda>{foto.legenda}</Legenda>
          </figure>
        ))}
      </Grade>
    </Fotos>
  );
}

// Encerramento: leva à área comunitária deste mistério e à área geral de teorias e investigações.
export function TransicaoComunidade({ slug }: { slug: string }) {
  return (
    <Transicao aria-labelledby="misterio-comunidade">
      <h2 id="misterio-comunidade">Continue na comunidade</h2>
      <p>As teorias, as evidências e as discussões deste mistério ficam na área de teorias e investigações.</p>
      <Botoes>
        <BotaoPrimario href={ROUTES.comunidadeInvestigacao(slug)}>Explorar teorias e investigações</BotaoPrimario>
        <BotaoSecundario href={ROUTES.teorias}>Todas as teorias e investigações</BotaoSecundario>
      </Botoes>
    </Transicao>
  );
}

const Artigo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  font-size: 16px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitulo = styled.h2`
  margin-top: 8px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
`;

const Destaque = styled.div`
  padding: 20px;
  border: 1px dashed ${({ theme }) => theme.colors.pink};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const RotuloDestaque = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.pink};
`;

const Lead = styled.p`
  margin-top: 6px;
  font-size: 18px;
  line-height: 1.6;
`;

const Pergunta = styled.div`
  padding: 16px 20px;
  border-left: 3px solid ${({ theme }) => theme.colors.pink};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  p {
    margin-top: 6px;
    font-size: 17px;
    font-weight: 600;
  }
`;

const Lista = styled.ul`
  padding-left: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};

  li + li {
    margin-top: 4px;
  }
`;

const Fotos = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const Grade = styled.div<{ $quantidade: number }>`
  display: grid;
  gap: 16px;
  max-width: ${({ $quantidade }) => ($quantidade === 1 ? "560px" : "100%")};
  grid-template-columns: ${({ $quantidade }) =>
    $quantidade === 1 ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))"};

  figure {
    min-width: 0;
    margin: 0;
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Quadro = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Legenda = styled.figcaption`
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Transicao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.card};

  h2 {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 24px;
    text-transform: uppercase;
  }

  p {
    font-size: 15px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Botoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
`;

const botaoBase = `
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
`;

const BotaoPrimario = styled(Link)`
  ${botaoBase}
  background: ${({ theme }) => theme.colors.gradientStart};
  color: ${({ theme }) => theme.colors.white};
`;

const BotaoSecundario = styled(Link)`
  ${botaoBase}
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;
