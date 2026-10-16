"use client";

import Image from "next/image";
import styled from "styled-components";

import mapaReferencia from "../../assets/images/exemplo_2.jpg";

// Visual concept of the future interactive map. The map is a static reference image:
// no markers, no geolocation, no saved coordinates. Marking locations is a future feature.
export function LocalizacaoEvidencias() {
  return (
    <Wrapper>
      <Texto>
        Esta área vai mostrar onde cada evidência foi encontrada. A visualização abaixo é
        demonstrativa: ela representa a ideia, mas ainda não marca nenhum local real.
      </Texto>

      <Figura>
        <Quadro>
          <Image
            src={mapaReferencia}
            alt="Imagem de referência de um mapa, sem marcações reais."
            sizes="(max-width: 767px) 50vw, 240px"
          />
        </Quadro>
        <Legenda>
          Mapa de referência, demonstrativo. A marcação de locais por evidência será implementada em uma etapa futura.
        </Legenda>
      </Figura>

      <Nota>
        Quando existir, a marcação poderá ser feita pelo investigador responsável e sugerida por membros da comunidade, com análise antes de ser aceita.
      </Nota>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Texto = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Figura = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  min-width: 0;
`;

// Frame with a neutral surface. The image keeps its own proportion and is never cropped:
// width is automatic and only limited, so the map shows at about half its previous size.
// Desktop: 240px maximum height (about 189px wide, half of the previous 378px).
// Mobile: 50% of the frame width (about half of the previous 325px), with no cropping.
const Quadro = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 240px;
  }

  @media (max-width: 767px) {
    padding: 8px;

    img {
      max-width: 50%;
      max-height: none;
    }
  }
`;

const Legenda = styled.figcaption`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
