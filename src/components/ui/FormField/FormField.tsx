"use client";

import { useId } from "react";

import { FormFieldContext } from "./FormField.context";
import { Dica, Erro, Label, Obrigatorio, Wrapper } from "./FormField.styles";
import type { FormFieldProps } from "./FormField.types";

// Wraps one control. The label, hint and error are linked to the control
// through the context, so Input and Textarea need no extra wiring.
export function FormField({ label, children, hint, error, required = false }: FormFieldProps) {
  const id = useId();
  const dicaId = `${id}-dica`;
  const erroId = `${id}-erro`;
  const describedBy = [hint ? dicaId : null, error ? erroId : null].filter(Boolean).join(" ") || undefined;

  return (
    <FormFieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
      <Wrapper>
        <Label htmlFor={id}>
          {label}
          {required ? <Obrigatorio aria-hidden="true">*</Obrigatorio> : null}
        </Label>
        {children}
        {hint ? <Dica id={dicaId}>{hint}</Dica> : null}
        {error ? <Erro id={erroId}>{error}</Erro> : null}
      </Wrapper>
    </FormFieldContext.Provider>
  );
}
