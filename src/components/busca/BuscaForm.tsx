"use client";

import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { AbaBusca } from "../../lib/busca";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";

export interface BuscaFormProps {
  consulta: string;
  aba: AbaBusca;
}

// Formulário GET: envia ?q= para a própria rota, sem JavaScript. A aba atual segue
// no envio (campo oculto tipo), para uma nova consulta manter o tipo escolhido.
export function BuscaForm({ consulta, aba }: BuscaFormProps) {
  return (
    <Form role="search" method="get" action={ROUTES.buscar} noValidate>
      <Campo>
        <FormField label="Termo da busca">
          <Input
            name="q"
            type="search"
            defaultValue={consulta}
            placeholder="Ex.: Frequência, bunker, analista"
            autoComplete="off"
          />
        </FormField>
      </Campo>

      {aba !== "todos" ? <input type="hidden" name="tipo" value={aba} /> : null}

      <Button type="submit" variant="primary" size="medium">
        Buscar
      </Button>
    </Form>
  );
}

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Campo = styled.div`
  flex: 1 1 280px;
  min-width: 0;
`;
