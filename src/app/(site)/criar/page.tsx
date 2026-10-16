import type { Metadata } from "next";

import { CriarTeoria } from "../../../components/criar/CriarTeoria";

export const metadata: Metadata = {
  title: "Criar teoria | ARCHIVES VI",
  description: "Demonstração de criação de teoria. Nada é publicado nem salvo.",
};

export default function CriarPage() {
  return <CriarTeoria />;
}
