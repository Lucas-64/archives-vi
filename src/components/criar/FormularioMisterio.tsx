"use client";

import type { FormEvent } from "react";
import styled from "styled-components";

import { CLASSIFICACOES_MISTERIO } from "../../constants/classificacoesMisterio";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { UploadImagem } from "../ui/UploadImagem";
import { LIMITES_NOVO_MISTERIO as L, type ErrosMisterio, type RascunhoMisterio } from "./validarMisterio";

export interface FormularioMisterioProps {
  rascunho: RascunhoMisterio;
  erros: ErrosMisterio;
  erroGeral: string | null;
  enviando: boolean;
  onAlterar: (proximo: RascunhoMisterio, chaves: string[]) => void;
  onEnviar: (event: FormEvent<HTMLFormElement>) => void;
}

const contagem = (valor: string, maximo: number) => `${valor.trim().length} de ${maximo} caracteres.`;

// Formulário curto de mistério, na ordem em que a página é lida: título, imagem, vídeo, descrição e classificação.
// Validação feita pelo pai; noValidate evita a validação nativa.
export function FormularioMisterio({ rascunho: r, erros, erroGeral, enviando, onAlterar, onEnviar }: FormularioMisterioProps) {
  const campo = <K extends keyof RascunhoMisterio>(nome: K, valor: RascunhoMisterio[K], chaves: string[]) =>
    onAlterar({ ...r, [nome]: valor }, chaves);

  return (
    <Form noValidate onSubmit={onEnviar} aria-label="Novo mistério">
      <FormField label="Título" required hint={contagem(r.titulo, L.titulo.maximo)} error={erros.titulo}>
        <Input name="titulo" autoComplete="off" value={r.titulo} onChange={(e) => campo("titulo", e.target.value, ["titulo"])} />
      </FormField>

      <UploadImagem
        rotulo="Imagem (opcional)"
        opcional
        dica="JPEG, PNG ou WebP, até 5 MB. Aparece no card e na página. Sem imagem, usa-se uma imagem padrão."
        proporcao="16 / 7"
        valor={r.imagemUrl}
        erro={erros.imagem}
        onChange={(url) => campo("imagemUrl", url ?? "", ["imagem"])}
      />

      <FormField label="Link do vídeo no YouTube (opcional)" error={erros["video.url"]}>
        <Input name="videoUrl" type="url" autoComplete="off" value={r.videoUrl} onChange={(e) => campo("videoUrl", e.target.value, ["video.url"])} />
      </FormField>
      <FormField label="Título do vídeo (opcional)" error={erros["video.titulo"]}>
        <Input name="videoTitulo" autoComplete="off" value={r.videoTitulo} onChange={(e) => campo("videoTitulo", e.target.value, ["video.titulo"])} />
      </FormField>

      <FormField label="Descrição" required hint={contagem(r.descricao, L.descricao.maximo)} error={erros.descricao}>
        <Textarea name="descricao" rows={5} value={r.descricao} onChange={(e) => campo("descricao", e.target.value, ["descricao"])} />
      </FormField>

      <Fieldset>
        <legend>
          Classificação <span aria-hidden="true">*</span>
        </legend>
        {CLASSIFICACOES_MISTERIO.map((item) => (
          <label key={item.id}>
            <input
              type="radio"
              name="classificacao"
              checked={r.classificacao === item.id}
              onChange={() => campo("classificacao", item.id, ["classificacao"])}
            />{" "}
            {item.rotulo} <Dica>{item.criterio}</Dica>
          </label>
        ))}
        {erros.classificacao ? <ErroCampo role="alert">{erros.classificacao}</ErroCampo> : null}
      </Fieldset>

      {Object.keys(erros).length > 0 ? <Alerta role="alert">Não foi possível enviar. Corrija os campos destacados.</Alerta> : null}
      {erroGeral ? <Alerta role="alert">{erroGeral}</Alerta> : null}

      <Acoes>
        <Button type="submit" variant="primary" size="large" loading={enviando} loadingLabel="Publicando">
          Publicar mistério
        </Button>
      </Acoes>
    </Form>
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
  border: 0;
  padding: 0;

  legend {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  label {
    font-size: 14px;
  }
`;

const Dica = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErroCampo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.debunked};
`;

const Alerta = styled.p`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.debunked};
  font-size: 14px;
  line-height: 1.5;
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
