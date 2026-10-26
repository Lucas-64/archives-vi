import type { Metadata } from "next";

import { CriarMisterio } from "../../../../components/criar/CriarMisterio";

export const metadata: Metadata = {
  title: "Criar mistério | ARCHIVES VI",
  description: "Abra um mistério com hipótese, argumentos e fontes.",
};

export default function CriarMisterioPage() {
  return <CriarMisterio />;
}
