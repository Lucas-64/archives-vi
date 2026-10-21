"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { editarPerfilNaApi, type PerfilEditado } from "../../lib/perfilApi";
import {
  ABAS_MEU_PERFIL,
  LIMITE_BIO_PERFIL,
  LIMITE_NOME_PERFIL,
  validarEdicaoPerfil,
  type ErrosEdicaoPerfil,
} from "../../lib/meuPerfil";
import type { Criador } from "../../types/Criador";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { AbasPerfil } from "./AbasPerfil";

export interface MeuPerfilAreaProps {
  // A pessoa da sessão, com os dados gravados no servidor. Nunca um criador fixo.
  criador: Criador;
  // Conteúdo servidor das abas: "teorias-publicacoes" e "investigacoes".
  paineis: Record<string, ReactNode>;
}

// Área Meu Perfil (ADR-021) com dados reais. A edição de nome e bio chama PATCH /api/v1/me/perfil e só
// mostra sucesso quando o servidor confirma. Visão geral, evidências, atividade, patente e conquistas
// voltam na Fatia 6 da Etapa I, quando houver dados reais para elas (não há mais dados demonstrativos aqui).
export function MeuPerfilArea({ criador, paineis }: MeuPerfilAreaProps) {
  const router = useRouter();
  const idBase = useId();
  const formId = `${idBase}-edicao`;

  // Dados exibidos: os do servidor, atualizados pela resposta da API quando a edição é confirmada.
  const [perfil, setPerfil] = useState<PerfilEditado>({ nome: criador.nome, bio: criador.bio });
  const [rascunho, setRascunho] = useState<PerfilEditado>(perfil);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosEdicaoPerfil>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function abrirEdicao() {
    setRascunho(perfil);
    setErros({});
    setErroGeral(null);
    setAviso(null);
    setEditando(true);
  }

  function cancelarEdicao() {
    setRascunho(perfil);
    setErros({});
    setErroGeral(null);
    setEditando(false);
  }

  async function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;

    const proximosErros = validarEdicaoPerfil(rascunho);
    setErros(proximosErros);
    setErroGeral(null);
    if (Object.keys(proximosErros).length > 0) return;

    setSalvando(true);
    const resultado = await editarPerfilNaApi({ nome: rascunho.nome.trim(), bio: rascunho.bio.trim() });
    setSalvando(false);

    if (resultado.ok) {
      setPerfil(resultado.perfil);
      setEditando(false);
      setAviso("Perfil atualizado.");
      router.refresh();
      return;
    }
    if (resultado.semSessao) {
      // Sessão expirada ou revogada: o servidor decide a página (redireciona para /entrar).
      router.refresh();
    }
    setErros({ nome: resultado.campos.nome, bio: resultado.campos.bio });
    setErroGeral(resultado.erroGeral ?? null);
  }

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

          {perfil.bio ? <Bio>{perfil.bio}</Bio> : null}

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

          {aviso ? <Aviso role="status">{aviso}</Aviso> : null}

          {editando ? (
            <Formulario id={formId} onSubmit={salvarEdicao} noValidate aria-labelledby={`${idBase}-titulo-edicao`}>
              <SubtituloForm id={`${idBase}-titulo-edicao`}>Editar perfil</SubtituloForm>

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

              {erroGeral ? <ErroGeral role="alert">{erroGeral}</ErroGeral> : null}

              <Acoes>
                <Button type="submit" variant="primary" size="small" loading={salvando} loadingLabel="Salvando">
                  Salvar alterações
                </Button>
                <Button type="button" variant="ghost" size="small" onClick={cancelarEdicao} disabled={salvando}>
                  Cancelar
                </Button>
              </Acoes>
            </Formulario>
          ) : null}
        </Identidade>
      </Topo>

      <AbasPerfil
        abas={ABAS_MEU_PERFIL}
        rotuloLista="Seções do meu perfil"
        variante="caixa"
        acoes={
          <Acoes>
            <LinkPrimario href={ROUTES.criar}>+ Criar teoria</LinkPrimario>
            <LinkContorno href={ROUTES.criarInvestigacao}>+ Criar investigação</LinkContorno>
          </Acoes>
        }
        paineis={{
          "teorias-publicacoes": paineis["teorias-publicacoes"],
          investigacoes: paineis.investigacoes,
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

// Topo: identidade. A patente (cartão à direita) volta quando houver dados reais (Fatia 6).
const Topo = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-width: 0;
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
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gradientStart}, ${({ theme }) => theme.colors.gradientEnd});

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
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

const ErroGeral = styled.p`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.debunked};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;
