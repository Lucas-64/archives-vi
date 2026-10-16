import { createContext, useContext } from "react";

export interface FormFieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

interface AtributosDoCampo {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  describedBy?: string;
}

// Combines the props given to a control with the ones provided by FormField.
// Inside FormField, the generated id wins over an `id` passed to the control,
// because the label always points to the generated id. Outside FormField the
// `id` prop is used as given.
export function useAtributosDoCampo({ id, invalid = false, required, describedBy }: AtributosDoCampo) {
  const campo = useContext(FormFieldContext);
  const estaInvalido = invalid || Boolean(campo?.invalid);
  const descrito = [describedBy, campo?.describedBy].filter(Boolean).join(" ") || undefined;

  return {
    id: campo ? campo.id : id,
    required: required ?? campo?.required,
    "aria-invalid": estaInvalido || undefined,
    "aria-describedby": descrito,
    $invalid: estaInvalido,
  };
}
