"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { useSessao } from "../auth/SessaoProvider";

// Colunas de links: só rotas que existem. Mapa, Galeria e Fórum não têm rota e ficam de fora (ADR-036).
const COLUNAS = [
  {
    titulo: "Explorar",
    links: [
      { label: "Mistérios", href: ROUTES.misterios },
      { label: "Teorias e investigações", href: ROUTES.teorias },
      { label: "Explorar", href: ROUTES.explorar },
      { label: "Criadores", href: ROUTES.criadores },
    ],
  },
  {
    titulo: "Participar",
    links: [
      { label: "Criar teoria", href: ROUTES.criar },
      { label: "Criar mistério", href: ROUTES.criarMisterio },
      { label: "Buscar", href: ROUTES.buscar },
    ],
  },
] as const;

// Rodapé do site: identidade, três colunas de links e o aviso legal (do README.md) em uma faixa própria.
export function Footer() {
  const { estado } = useSessao();
  // A coluna de conta acompanha a sessão; enquanto ela é consultada, mostra a versão de visitante.
  const conta =
    estado === "autenticado"
      ? [{ label: "Meu perfil", href: ROUTES.meuPerfil }]
      : [
          { label: "Entrar", href: ROUTES.entrar },
          { label: "Criar conta", href: ROUTES.criarConta },
        ];
  const colunas = [...COLUNAS, { titulo: "Conta", links: conta }];

  return (
    <FooterContainer>
      <Topo>
        <Marca>
          <Brand href={ROUTES.inicio}>
            ARCHIVES <span>VI</span>
          </Brand>
          <Lema>A verdade está escondida em Leonida</Lema>
          <Resumo>Investigações, evidências e teorias da comunidade de GTA VI, reunidas em um só lugar.</Resumo>
        </Marca>

        <Colunas aria-label="Links do rodapé">
          {colunas.map((coluna) => (
            <Coluna key={coluna.titulo}>
              <TituloColuna>{coluna.titulo}</TituloColuna>
              <ul>
                {coluna.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </Coluna>
          ))}
        </Colunas>
      </Topo>

      <Legal>
        <Notice>
          Este site tem fins educacionais e de demonstração de portfólio. Grand Theft Auto VI e todos os recursos
          relacionados pertencem à Rockstar Games.
        </Notice>
      </Legal>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  margin-top: 48px;
  padding: 40px 48px 96px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  @media (min-width: 768px) {
    padding-bottom: 32px;
  }

  @media (max-width: 767px) {
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const Topo = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr);
  gap: 32px 48px;

  @media (max-width: 1023px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Marca = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
`;

const Brand = styled(Link)`
  width: fit-content;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};

  span {
    color: ${({ theme }) => theme.colors.pink};
    font-style: italic;
    text-shadow: ${({ theme }) => theme.shadows.glowPink};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const Lema = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};
`;

const Resumo = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Colunas = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 479px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    list-style: none;
  }

  a {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: color ${({ theme }) => theme.transitions.default};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const TituloColuna = styled.h2`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;

const Legal = styled.div`
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Notice = styled.p`
  max-width: 720px;
  font-size: 12px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
