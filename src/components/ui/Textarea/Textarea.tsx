"use client";

import { useAtributosDoCampo } from "../FormField/FormField.context";
import { StyledTextarea } from "./Textarea.styles";
import type { TextareaProps } from "./Textarea.types";

export function Textarea({ invalid, required, id, "aria-describedby": describedBy, ...props }: TextareaProps) {
  const atributos = useAtributosDoCampo({ id, invalid, required, describedBy });

  return <StyledTextarea {...atributos} {...props} />;
}
