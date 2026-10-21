import type { Metadata } from "next";

import { CriarTeoria } from "../../../components/criar/CriarTeoria";

export const metadata: Metadata = {
  title: "Criar teoria | ARCHIVES VI",
  description: "Escreva e publique uma teoria na comunidade.",
};

export default function CriarPage() {
  return <CriarTeoria />;
}
