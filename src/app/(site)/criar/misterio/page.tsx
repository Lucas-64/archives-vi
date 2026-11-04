import type { Metadata } from "next";

import { CriarMisterio } from "../../../../components/criar/CriarMisterio";

export const metadata: Metadata = {
  title: "Criar mistério | ARCHIVES VI",
  description: "Publique um mistério simples, com imagem ou vídeo.",
};

export default function CriarMisterioPage() {
  return <CriarMisterio />;
}
