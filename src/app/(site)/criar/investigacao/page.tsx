import type { Metadata } from "next";

import { CriarInvestigacao } from "../../../../components/criar/CriarInvestigacao";

export const metadata: Metadata = {
  title: "Criar investigação | ARCHIVES VI",
  description: "Abra uma investigação com hipótese, argumentos e fontes.",
};

export default function CriarInvestigacaoPage() {
  return <CriarInvestigacao />;
}
