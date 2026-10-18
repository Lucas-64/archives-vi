"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import {
  ABAS_MEU_PERFIL,
  LIMITE_BIO_PERFIL,
  LIMITE_NOME_PERFIL,
  validarEdicaoPerfil,
  type DadosEdicaoPerfil,
  type ErrosEdicaoPerfil,
} from "../../lib/meuPerfil";
import type { Case } from "../../types/Case";
import type { Conquista } from "../../types/Conquista";
import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import type { EvidenciaMeu, Notificacao, Solicitacao } from "../../types/MeuPerfil";
import type { PatentesDoMembro } from "../../types/Patente";
import { Avatar } from "../ui/Avatar";
import { Badge, type BadgeVariant } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { AcaoRestrita } from "../acoes/AcaoRestrita";
import { AbasPerfil } from "./AbasPerfil";
import { MeuPerfilAtividade } from "./MeuPerfilAtividade";
import { MeuPerfilPatente } from "./MeuPerfilPatente";
import { MeuPerfilVisaoGeral } from "./MeuPerfilVisaoGeral";
import type { TitulosInvestigacao } from "./MeuPerfilListas";

export interface MeuPerfilAreaProps {
  criador: Criador;
  patentes?: PatentesDoMembro;
  conquistas: Conquista[];
  notificacoes: Notificacao[];
  solicitacoes: Solicitacao[];
  evidencias: EvidenciaMeu[];
  titulos: TitulosInvestigacao;
  publicacoes: Publicacao[];
  investigacoes: Case[];
  // Conteúdo servidor das abas: "teorias-publicacoes", "investigacoes", "evidencias" e "atividade" (solicitações e respostas).
  paineis: Record<string, ReactNode>;
}

// Rótulos das conquistas no cabeçalho. A ordem das variantes segue a referência visual (azul, verde, dourado).
const VARIANTES_CONQUISTA: readonly BadgeVariant[] = ["info", "success", "warning", "primary", "secondary"];

const AVISO_NAO_SALVO =
  "Alterações aplicadas somente nesta página. Elas não são salvas: ao recarregar, o perfil volta ao original.";

// Área Meu Perfil (ADR-021), no layout da referência visual. Não há login, backend nem persistência:
// edição e leitura de notificações mudam só o estado desta página, e a interface avisa isso.
export function MeuPerfilArea({
  criador,
  patentes,
  conquistas,
  notificacoes,
  solicitacoes,
  evidencias,
  titulos,
  publicacoes,
  investigacoes,
  paineis,
}: MeuPerfilAreaProps) {
  const idBase = useId();
  const formId = `${idBase}-edicao`;

  // Dados exibidos. Começam no criador e mudam só quando a edição é salva nesta página.
  const [perfil, setPerfil] = useState<DadosEdicaoPerfil>({ nome: criador.nome, bio: criador.bio });
  const [rascunho, setRascunho] = useState<DadosEdicaoPerfil>(perfil);
  const [editando, setEditando] = useState(false);
  const [erros, setErros] = useState<ErrosEdicaoPerfil>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [lidas, setLidas] = useState<ReadonlySet<string>>(() => new Set());

  function abrirEdicao() {
    setRascunho(perfil);
    setErros({});
    setAviso(null);
    setEditando(true);
  }

  function cancelarEdicao() {
    setRascunho(perfil);
    setErros({});
    setEditando(false);
  }

  function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const proximosErros = validarEdicaoPerfil(rascunho);
    setErros(proximosErros);
    if (Object.keys(proximosErros).length > 0) return;

    setPerfil({ nome: rascunho.nome.trim(), bio: rascunho.bio.trim() });
    setEditando(false);
    setAviso(AVISO_NAO_SALVO);
  }

  function marcarLida(id: string) {
    setLidas((atual) => new Set(atual).add(id));
  }

  function marcarTodasLidas() {
    setLidas(new Set(notificacoes.map((item) => item.id)));
  }

  const naoLidas = notificacoes.filter((item) => !item.lida && !lidas.has(item.id)).length;

  return (
    <Area>
      <Topo>
        <Identidade padding="large">
          <Cabecalho>
            <Avatar nome={perfil.nome} size="large" />
            <Textos>
              <Nome>{perfil.nome}</Nome>
              <Usuario>@{criador.usuario}</Usuario>
            </Textos>
          </Cabecalho>

          <Bio>{perfil.bio}</Bio>

          <Badge size="small" variant="primary" uppercase>
            Seu perfil
          </Badge>

          <Acoes>
            <Button
              variant="primary"
              size="small"
              onClick={abrirEdicao}
              aria-expanded={editando}
              aria-controls={editando ? formId : undefined}
            >
              Editar perfil
            </Button>
            <LinkContorno href={ROUTES.perfil(criador.usuario)}>Ver perfil público</LinkContorno>
          </Acoes>

          {conquistas.length > 0 ? (
            <Conquistas aria-label="Conquistas">
              {conquistas.map((conquista, indice) => (
                <li key={conquista.id}>
                  <Badge size="small" variant={VARIANTES_CONQUISTA[indice % VARIANTES_CONQUISTA.length]} uppercase>
                    {conquista.nome}
                  </Badge>
                </li>
              ))}
            </Conquistas>
          ) : null}

          {aviso ? <Aviso role="status">{aviso}</Aviso> : null}

          {editando ? (
            <Formulario id={formId} onSubmit={salvarEdicao} noValidate aria-labelledby={`${idBase}-titulo-edicao`}>
              <SubtituloForm id={`${idBase}-titulo-edicao`}>Editar perfil</SubtituloForm>
              <Aviso>
                Demonstração: as alterações não são salvas. Elas valem só nesta página até você recarregá-la.
              </Aviso>

              <FormField label="Nome" required error={erros.nome} hint={`Até ${LIMITE_NOME_PERFIL} caracteres.`}>
                <Input
                  name="nome"
                  autoComplete="name"
                  value={rascunho.nome}
                  invalid={Boolean(erros.nome)}
                  onChange={(evento) => setRascunho({ ...rascunho, nome: evento.target.value })}
                />
              </FormField>

              <FormField
                label="Bio"
                error={erros.bio}
                hint={`${rascunho.bio.trim().length} de ${LIMITE_BIO_PERFIL} caracteres.`}
              >
                <Textarea
                  name="bio"
                  rows={4}
                  value={rascunho.bio}
                  invalid={Boolean(erros.bio)}
                  onChange={(evento) => setRascunho({ ...rascunho, bio: evento.target.value })}
                />
              </FormField>

              <Acoes>
                <Button type="submit" variant="primary" size="small">
                  Salvar alterações
                </Button>
                <Button type="button" variant="ghost" size="small" onClick={cancelarEdicao}>
                  Cancelar
                </Button>
              </Acoes>
            </Formulario>
          ) : null}
        </Identidade>

        <MeuPerfilPatente patentes={patentes} />
      </Topo>

      <AbasPerfil
        abas={ABAS_MEU_PERFIL}
        rotuloLista="Seções do meu perfil"
        variante="caixa"
        acoes={
          <>
            <LinkPrimario href={ROUTES.criar}>+ Criar teoria</LinkPrimario>
            <AcaoRestrita rotulo="Abrir investigação" mensagem="Abrir investigação exige conta." />
          </>
        }
        paineis={{
          "visao-geral": (
            <MeuPerfilVisaoGeral
              solicitacoes={solicitacoes}
              evidencias={evidencias}
              notificacoes={notificacoes}
              lidas={lidas}
              onMarcar={marcarLida}
              publicacoes={publicacoes}
              investigacoes={investigacoes}
              titulos={titulos}
            />
          ),
          "teorias-publicacoes": paineis["teorias-publicacoes"],
          investigacoes: paineis.investigacoes,
          evidencias: paineis.evidencias,
          atividade: (
            <>
              <CabecalhoAtividade>
                <Grupo>
                  <TituloAtividade id={`${idBase}-notificacoes`}>Notificações</TituloAtividade>
                  <Badge size="small" variant={naoLidas > 0 ? "primary" : "default"}>
                    {naoLidas === 1 ? "1 não lida" : `${naoLidas} não lidas`}
                  </Badge>
                </Grupo>
                {naoLidas > 0 ? (
                  <Button variant="outline" size="small" onClick={marcarTodasLidas}>
                    Marcar todas como lidas
                  </Button>
                ) : null}
              </CabecalhoAtividade>
              <Aviso>
                Notificações demonstrativas: nenhum evento real foi recebido. Marcar como lida não é salvo; ao
                recarregar a página, o estado volta ao original.
              </Aviso>
              <MeuPerfilAtividade itens={notificacoes} lidas={lidas} onMarcar={marcarLida} />
              {paineis.atividade}
            </>
          ),
        }}
      />
    </Area>
  );
}

const Area = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

// Topo: identidade à esquerda e patente à direita em desktop; empilhado em telas menores.
const Topo = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 380px;
    align-items: stretch;
  }
`;

const Identidade = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
`;

const Textos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const Nome = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 30px;
  }
`;

const Usuario = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Bio = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

const LinkContorno = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 10px 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;

// Ação principal da linha de abas (ex.: "+ Criar teoria"), com o mesmo gradiente do cabeçalho do site.
const LinkPrimario = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.pink}, ${({ theme }) => theme.colors.purple});

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;

const Conquistas = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Aviso = styled.p`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Formulario = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SubtituloForm = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
`;

const CabecalhoAtividade = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Grupo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
`;

const TituloAtividade = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 17px;
  font-weight: 800;
  text-transform: uppercase;
`;
