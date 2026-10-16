"use client";

import type { FormEvent } from "react";
import styled from "styled-components";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { LIMITES_TEORIA, type ErrosTeoria, type RascunhoTeoria } from "./validarTeoria";

// Texto da simulação de envio (docs/page-specs/criar.md, seção 8). Nada é gravado.
export const MENSAGEM_SIMULACAO =
  "Simulação: sua teoria não foi publicada nem salva. O envio real depende de backend e de conta, que ainda não existem.";

export interface FormularioTeoriaProps {
  rascunho: RascunhoTeoria;
  erros: ErrosTeoria;
  mostrarResumoErro: boolean;
  simulado: boolean;
  onAlterar: (campo: keyof RascunhoTeoria, valor: string) => void;
  onEnviar: (event: FormEvent<HTMLFormElement>) => void;
}

// Formulário de criação de teoria. Validação feita pelo pai; noValidate evita a validação nativa.
export function FormularioTeoria({
  rascunho,
  erros,
  mostrarResumoErro,
  simulado,
  onAlterar,
  onEnviar,
}: FormularioTeoriaProps) {
  const { titulo: limiteTitulo, texto: limiteTexto } = LIMITES_TEORIA;
  const tamanhoTitulo = rascunho.titulo.trim().length;
  const tamanhoTexto = rascunho.texto.trim().length;

  return (
    <Card padding="large">
      <Form noValidate onSubmit={onEnviar} aria-label="Nova teoria">
        <Nota>Demonstração: nada é publicado nem salvo.</Nota>

        <FormField
          label="Título"
          required
          hint={`${tamanhoTitulo} de ${limiteTitulo.maximo} caracteres (mínimo de ${limiteTitulo.minimo}).`}
          error={erros.titulo}
        >
          <Input
            type="text"
            name="titulo"
            autoComplete="off"
            value={rascunho.titulo}
            onChange={(event) => onAlterar("titulo", event.target.value)}
          />
        </FormField>

        <FormField
          label="Texto da teoria"
          required
          hint={`${tamanhoTexto} de ${limiteTexto.maximo} caracteres (mínimo de ${limiteTexto.minimo}). Texto simples, sem formatação.`}
          error={erros.texto}
        >
          <Textarea
            name="texto"
            value={rascunho.texto}
            onChange={(event) => onAlterar("texto", event.target.value)}
          />
        </FormField>

        {mostrarResumoErro ? (
          <Alerta role="alert">Não foi possível enviar. Corrija os campos destacados.</Alerta>
        ) : null}

        {simulado ? <Aviso role="status">{MENSAGEM_SIMULACAO}</Aviso> : null}

        <Acoes>
          <Button type="submit" variant="primary" size="large">
            Enviar simulação
          </Button>
        </Acoes>
      </Form>
    </Card>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const Nota = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
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

const Aviso = styled.p`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.unexplained};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
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
