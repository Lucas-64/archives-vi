import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
}
