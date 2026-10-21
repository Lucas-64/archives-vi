"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarNumero } from "../../lib/formatacao";
import { criarComentarioNaApi, listarComentariosNaApi, type ComentarioApi } from "../../lib/publicacoesApi";
import { useSessao } from "../auth/SessaoProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Textarea } from "../ui/Textarea";

export interface ComentariosSectionProps {
  slug: string;
  // Total real (contagem do servidor) e a primeira página de comentários, em ordem cronológica.
  total: number;
  iniciais: ComentarioApi[];
  proximoCursor: string | null;
}

const LIMITE_TEXTO = 2000;

// Comentários reais. A lista e o total vêm do servidor; um comentário só entra na tela depois de o servidor
// confirmá-lo. Comentar exige sessão; para visitantes o campo fica desabilitado, com link para /entrar.
export function ComentariosSection({ slug, total, iniciais, proximoCursor }: ComentariosSectionProps) {
  const router = useRouter();
  const { estado } = useSessao();
  const id = useId();

  const [comentarios, setComentarios] = useState(iniciais);
  const [cursor, setCursor] = useState(proximoCursor);
  const [contagem, setContagem] = useState(total);
  const [texto, setTexto] = useState("");
  const [erroTexto, setErroTexto] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erroMais, setErroMais] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const limpo = texto.trim();
    if (!limpo) {
      setErroTexto("Escreva o comentário.");
      return;
    }
    if (limpo.length > LIMITE_TEXTO) {
      setErroTexto(`O comentário pode ter no máximo ${LIMITE_TEXTO} caracteres.`);
      return;
    }
    setErroTexto(undefined);
    setErroGeral(null);
    setEnviando(true);
    const resultado = await criarComentarioNaApi(slug, limpo);
    setEnviando(false);

    if (resultado.ok) {
      setTexto("");
      // Sem outra página pendente, o comentário novo é o último da conversa; com mais páginas, ele aparece
      // quando a lista chegar até ele, então só o total muda.
      if (cursor === null) setComentarios((atuais) => [...atuais, resultado.comentario]);
      setContagem((atual) => atual + 1);
      router.refresh();
      return;
    }
    setErroTexto(resultado.campos.texto);
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para comentar." : (resultado.erroGeral ?? null));
  }

  async function carregarMais() {
    if (!cursor || carregandoMais) return;
    setCarregandoMais(true);
    setErroMais(null);
    const resultado = await listarComentariosNaApi(slug, cursor);
    setCarregandoMais(false);
    if (!resultado.ok) {
      setErroMais(resultado.erroGeral ?? "Não foi possível carregar mais comentários.");
      return;
    }
    setComentarios((atuais) => {
      const vistos = new Set(atuais.map((c) => c.id));
      return [...atuais, ...resultado.comentarios.filter((c) => !vistos.has(c.id))];
    });
    setCursor(resultado.proximoCursor);
  }

  const podeComentar = estado === "autenticado";

  return (
    <Section aria-labelledby={`${id}-titulo`}>
      <Titulo id={`${id}-titulo`}>
        Comentários <Total>({formatarNumero(contagem)})</Total>
      </Titulo>

      {comentarios.length === 0 ? (
        <Vazio>Ainda não há comentários. Seja a primeira pessoa a comentar.</Vazio>
      ) : (
        <Lista>
          {comentarios.map((comentario) => (
            <Item key={comentario.id}>
              <Avatar nome={comentario.autor.nome} size="small" />
              <Corpo>
                <Cabecalho>
                  <Autor href={ROUTES.perfil(comentario.autor.usuario)}>@{comentario.autor.usuario}</Autor>
                  <time dateTime={comentario.criadoEm}>{formatarInstante(comentario.criadoEm)}</time>
                </Cabecalho>
                <Texto>{comentario.texto}</Texto>
              </Corpo>
            </Item>
          ))}
        </Lista>
      )}

      {cursor ? (
        <Mais>
          <Button variant="outline" size="small" onClick={carregarMais} loading={carregandoMais} loadingLabel="Carregando">
            Ver mais comentários
          </Button>
          {erroMais ? <Erro role="alert">{erroMais}</Erro> : null}
        </Mais>
      ) : null}

      <Formulario onSubmit={enviar} noValidate aria-label="Novo comentário">
        <FormField label="Escreva um comentário" error={erroTexto} hint={`${texto.trim().length} de ${LIMITE_TEXTO} caracteres.`}>
          <Textarea
            name="texto"
            rows={3}
            value={texto}
            disabled={!podeComentar || enviando}
            placeholder={estado === "visitante" ? "Entre na sua conta para comentar" : undefined}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        </FormField>
        {erroGeral ? <Erro role="alert">{erroGeral}</Erro> : null}
        <Acoes>
          {estado === "visitante" ? <EntrarLink href={ROUTES.entrar}>Entre para comentar</EntrarLink> : <span />}
          <Button type="submit" variant="primary" size="small" disabled={!podeComentar} loading={enviando} loadingLabel="Publicando">
            Publicar comentário
          </Button>
        </Acoes>
      </Formulario>
    </Section>
  );
}

// "AAAA-MM-DDTHH:MM:SS…Z" em pt-BR, no fuso de Brasília (fixo, para o servidor e o navegador concordarem).
function formatarInstante(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(data);
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  min-width: 0;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Total = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Vazio = styled.p`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
`;

const Item = styled.li`
  display: flex;
  gap: 12px;
  min-width: 0;
`;

const Corpo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Autor = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};
`;

const Texto = styled.p`
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const Mais = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const Formulario = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const EntrarLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};
`;

const Erro = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  border-left: 3px solid ${({ theme }) => theme.colors.debunked};
  padding-left: 10px;
`;
