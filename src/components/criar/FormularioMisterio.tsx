"use client";

import { useId, type FormEvent } from "react";
import styled from "styled-components";

import { TAGS_TEMATICAS } from "../../constants/tagsTematicas";
import { MAXIMO_ITENS_LISTA } from "../../lib/investigacoesApi";
import { ROTULO_CATEGORIA } from "../../lib/investigacaoEstado";
import { Secao } from "../investigacao/Secao";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import {
  CATEGORIAS_NOVA_INVESTIGACAO,
  LIMITES_NOVA_INVESTIGACAO as L,
  type ErrosInvestigacao,
  type RascunhoInvestigacao,
} from "./validarInvestigacao";

export interface FormularioMisterioProps {
  rascunho: RascunhoInvestigacao;
  erros: ErrosInvestigacao;
  mostrarResumoErro: boolean;
  erroGeral: string | null;
  enviando: boolean;
  // Recebe o rascunho novo e as chaves de erro que a alteração invalida.
  onAlterar: (proximo: RascunhoInvestigacao, chaves: string[]) => void;
  onEnviar: (event: FormEvent<HTMLFormElement>) => void;
}

const contagem = (valor: string, maximo: number) => `${valor.trim().length} de ${maximo} caracteres.`;

// Formulário de criação de mistério (cria uma investigação pela API real), nas mesmas seções da página do
// mistério: Identificação, Vídeo e Teoria; as evidências vêm depois da criação, na área da comunidade. Validação feita pelo pai; noValidate evita a
// validação nativa. Não há envio de imagens nem de evidências aqui: a API de criação não os aceita.
export function FormularioMisterio({ rascunho: r, erros, mostrarResumoErro, erroGeral, enviando, onAlterar, onEnviar }: FormularioMisterioProps) {
  const id = useId();
  const campo = <K extends keyof RascunhoInvestigacao>(nome: K, valor: RascunhoInvestigacao[K], chaves: string[]) =>
    onAlterar({ ...r, [nome]: valor }, chaves);

  function alterarItem(lista: "argumentos" | "fontes", indice: number, valor: string) {
    const itens = r[lista].map((item, i) => (i === indice ? valor : item));
    campo(lista, itens, [chaveLista(lista)]);
  }
  function removerItem(lista: "argumentos" | "fontes", indice: number) {
    campo(lista, r[lista].filter((_, i) => i !== indice), [chaveLista(lista)]);
  }
  function alternarTema(tema: string) {
    campo("tags", r.tags.includes(tema) ? r.tags.filter((t) => t !== tema) : [...r.tags, tema], ["tags"]);
  }

  return (
    <Form noValidate onSubmit={onEnviar} aria-label="Novo mistério">
      <Secao id="passo-identificacao" titulo="Identificação">
        <FormField label="Título" required hint={contagem(r.titulo, L.titulo.maximo)} error={erros.titulo}>
          <Input name="titulo" autoComplete="off" value={r.titulo} onChange={(e) => campo("titulo", e.target.value, ["titulo"])} />
        </FormField>

        <FormField label="Descrição" required hint={contagem(r.descricao, L.descricao.maximo)} error={erros.descricao}>
          <Textarea name="descricao" rows={4} value={r.descricao} onChange={(e) => campo("descricao", e.target.value, ["descricao"])} />
        </FormField>

        <Fieldset aria-describedby={erros.categoria ? `${id}-categoria-erro` : undefined}>
          <legend>
            Categoria <span aria-hidden="true">*</span>
          </legend>
          {CATEGORIAS_NOVA_INVESTIGACAO.map((valor) => (
            <label key={valor}>
              <input
                type="radio"
                name={`${id}-categoria`}
                checked={r.categoria === valor}
                onChange={() => campo("categoria", valor, ["categoria"])}
              />{" "}
              {ROTULO_CATEGORIA[valor]}
            </label>
          ))}
          {erros.categoria ? <ErroCampo id={`${id}-categoria-erro`} role="alert">{erros.categoria}</ErroCampo> : null}
        </Fieldset>

        <FormField label="Localização (opcional)" hint="Texto livre, por exemplo o nome de um lugar do jogo." error={erros.localizacao}>
          <Input name="localizacao" autoComplete="off" value={r.localizacao} onChange={(e) => campo("localizacao", e.target.value, ["localizacao"])} />
        </FormField>

        <Fieldset>
          <legend>Temas (opcional)</legend>
          {TAGS_TEMATICAS.map((tema) => (
            <label key={tema.id}>
              <input type="checkbox" checked={r.tags.includes(tema.id)} onChange={() => alternarTema(tema.id)} /> {tema.rotulo}
            </label>
          ))}
          {erros.tags ? <ErroCampo role="alert">{erros.tags}</ErroCampo> : null}
        </Fieldset>

      </Secao>

      <Secao id="passo-video" titulo="Vídeo (opcional)">
        <FormField label="Link do YouTube" error={erros["video.url"]}>
          <Input name="videoUrl" type="url" autoComplete="off" value={r.videoUrl} onChange={(e) => campo("videoUrl", e.target.value, ["video.url"])} />
        </FormField>
        <FormField label="Título do vídeo" error={erros["video.titulo"]}>
          <Input name="videoTitulo" autoComplete="off" value={r.videoTitulo} onChange={(e) => campo("videoTitulo", e.target.value, ["video.titulo"])} />
        </FormField>
      </Secao>

      <Secao id="passo-teoria" titulo="Teoria">
        <FormField label="Hipótese" required hint={contagem(r.hipotese, L.hipotese.maximo)} error={erros["teoria.hipotese"]}>
          <Textarea name="hipotese" rows={6} value={r.hipotese} onChange={(e) => campo("hipotese", e.target.value, ["teoria.hipotese"])} />
        </FormField>

        <FormField label="Pergunta central" required hint={contagem(r.perguntaCentral, L.perguntaCentral.maximo)} error={erros["teoria.perguntaCentral"]}>
          <Input name="perguntaCentral" autoComplete="off" value={r.perguntaCentral} onChange={(e) => campo("perguntaCentral", e.target.value, ["teoria.perguntaCentral"])} />
        </FormField>

        <ListaEditavel
          titulo="Argumentos favoráveis (opcional)"
          rotuloItem="Argumento"
          lista="argumentos"
          itens={r.argumentos}
          erros={erros}
          onAlterar={alterarItem}
          onRemover={removerItem}
          onAdicionar={() => campo("argumentos", [...r.argumentos, ""], [chaveLista("argumentos")])}
        />
        <ListaEditavel
          titulo="Fontes (opcional)"
          rotuloItem="Fonte"
          lista="fontes"
          itens={r.fontes}
          erros={erros}
          onAlterar={alterarItem}
          onRemover={removerItem}
          onAdicionar={() => campo("fontes", [...r.fontes, ""], [chaveLista("fontes")])}
        />
      </Secao>

      <Secao id="passo-evidencias" titulo="Evidências e histórico">
        <Aviso>
          As evidências não são enviadas aqui. Depois de criar o mistério, o responsável as envia na página dele, e o
          histórico registra cada mudança.
        </Aviso>
      </Secao>

      {mostrarResumoErro ? <Alerta role="alert">Não foi possível enviar. Corrija os campos destacados.</Alerta> : null}
      {erroGeral ? <Alerta role="alert">{erroGeral}</Alerta> : null}

      <Acoes>
        <Button type="submit" variant="primary" size="large" loading={enviando} loadingLabel="Criando">
          Criar mistério
        </Button>
      </Acoes>
    </Form>
  );
}

const chaveLista = (lista: "argumentos" | "fontes") => (lista === "argumentos" ? "teoria.argumentosFavoraveis" : "teoria.fontes");

interface ListaEditavelProps {
  titulo: string;
  rotuloItem: string;
  lista: "argumentos" | "fontes";
  itens: string[];
  erros: ErrosInvestigacao;
  onAlterar: (lista: "argumentos" | "fontes", indice: number, valor: string) => void;
  onRemover: (lista: "argumentos" | "fontes", indice: number) => void;
  onAdicionar: () => void;
}

function ListaEditavel({ titulo, rotuloItem, lista, itens, erros, onAlterar, onRemover, onAdicionar }: ListaEditavelProps) {
  const chave = chaveLista(lista);
  return (
    <Fieldset>
      <legend>{titulo}</legend>
      {itens.map((valor, i) => (
        <ItemLinha key={i}>
          <FormField label={`${rotuloItem} ${i + 1}`} hint={contagem(valor, L.item.maximo)} error={erros[`${chave}.${i}`]}>
            <Input autoComplete="off" value={valor} onChange={(e) => onAlterar(lista, i, e.target.value)} />
          </FormField>
          <Button type="button" variant="ghost" size="small" onClick={() => onRemover(lista, i)} aria-label={`Remover ${rotuloItem.toLowerCase()} ${i + 1}`}>
            Remover
          </Button>
        </ItemLinha>
      ))}
      {erros[chave] ? <ErroCampo role="alert">{erros[chave]}</ErroCampo> : null}
      <div>
        <Button type="button" variant="outline" size="small" onClick={onAdicionar} disabled={itens.length >= MAXIMO_ITENS_LISTA}>
          {`Adicionar ${rotuloItem.toLowerCase()}`}
        </Button>
        {itens.length >= MAXIMO_ITENS_LISTA ? <Nota>Máximo de {MAXIMO_ITENS_LISTA} itens.</Nota> : null}
      </div>
    </Fieldset>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  border: none;
  padding: 0;
  font-size: 14px;

  legend {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
  }

  label {
    overflow-wrap: anywhere;
  }
`;

const ItemLinha = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;

  & > :first-child {
    flex: 1;
    min-width: 0;
  }

  & > button {
    margin-top: 24px;
  }
`;

const ErroCampo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  border-left: 3px solid ${({ theme }) => theme.colors.debunked};
  padding-left: 10px;
`;

const Aviso = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nota = styled.span`
  margin-left: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Alerta = styled.p`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.debunked};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
`;

const Acoes = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 767px) {
    justify-content: stretch;

    & > * {
      width: 100%;
    }
  }
`;
