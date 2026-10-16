"use client";

import { useAtributosDoCampo } from "../FormField/FormField.context";
import { StyledInput } from "./Input.styles";
import type { InputProps } from "./Input.types";

export function Input({ invalid, required, id, "aria-describedby": describedBy, ...props }: InputProps) {
  const atributos = useAtributosDoCampo({ id, invalid, required, describedBy });

  return <StyledInput {...atributos} {...props} />;
}
